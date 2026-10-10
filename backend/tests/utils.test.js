// Dependency-free tests (plain node + assert). Run: node tests/utils.test.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseDateOnly, todayUtc, monthsBetween, overlapFilter, escapeRegex } = require('../utils/dates');
const { detectDocumentType } = require('../utils/fileSignature');

let passed = 0;
const test = (name, fn) => {
    try {
        fn();
        passed += 1;
        console.log(`  ok   ${name}`);
    } catch (err) {
        console.error(`  FAIL ${name}\n       ${err.message}`);
        process.exitCode = 1;
    }
};

// Mirrors Mongo's evaluation of overlapFilter for two half-open ranges.
const overlaps = (aStart, aEnd, bStart, bEnd) => {
    const f = overlapFilter(aStart, aEnd);
    return bStart < f.startDate.$lt && bEnd > f.endDate.$gt;
};
const d = (s) => parseDateOnly(s);

console.log('dates');
test('parses a valid date as UTC midnight', () => {
    assert.strictEqual(d('2030-03-15').toISOString(), '2030-03-15T00:00:00.000Z');
});
test('rejects impossible and malformed dates', () => {
    ['2030-02-30', '2030-13-01', '30-01-2030', '2030/01/01', '', null, undefined, 20300101, '2030-1-1']
        .forEach((v) => assert.strictEqual(parseDateOnly(v), null, String(v)));
});
test('todayUtc is midnight', () => {
    assert.strictEqual(todayUtc().getUTCHours(), 0);
});
test('overlap: back-to-back ranges do NOT overlap (new start == existing end)', () => {
    assert.strictEqual(overlaps(d('2030-02-01'), d('2030-03-01'), d('2030-01-01'), d('2030-02-01')), false);
    assert.strictEqual(overlaps(d('2030-01-01'), d('2030-02-01'), d('2030-02-01'), d('2030-03-01')), false);
});
test('overlap: one shared day overlaps', () => {
    assert.strictEqual(overlaps(d('2030-01-01'), d('2030-02-02'), d('2030-02-01'), d('2030-03-01')), true);
});
test('overlap: contained and containing ranges overlap', () => {
    assert.strictEqual(overlaps(d('2030-01-10'), d('2030-01-20'), d('2030-01-01'), d('2030-02-01')), true);
    assert.strictEqual(overlaps(d('2030-01-01'), d('2030-02-01'), d('2030-01-10'), d('2030-01-20')), true);
});
test('overlap: disjoint ranges do not overlap', () => {
    assert.strictEqual(overlaps(d('2030-01-01'), d('2030-01-10'), d('2030-02-01'), d('2030-03-01')), false);
});
test('monthsBetween ~ 1 for a 30/31-day span, ~12 for a year', () => {
    assert.ok(Math.abs(monthsBetween(d('2030-01-01'), d('2030-02-01')) - 1) < 0.1);
    assert.ok(Math.abs(monthsBetween(d('2030-01-01'), d('2031-01-01')) - 12) < 0.1);
});
test('escapeRegex neutralises regex metacharacters', () => {
    const re = new RegExp(escapeRegex('a.*(b'), 'i');
    assert.ok(re.test('xA.*(B'));
    assert.ok(!re.test('aXXXb'));
    assert.doesNotThrow(() => new RegExp(escapeRegex('(((')));
});

console.log('fileSignature');
const detect = (name, bytes) => {
    const f = path.join(os.tmpdir(), `smartlease-${process.pid}-${name}`);
    fs.writeFileSync(f, bytes);
    try { return detectDocumentType(f); } finally { fs.unlinkSync(f); }
};
test('detects PDF', () => assert.strictEqual(detect('a.pdf', Buffer.from('%PDF-1.7 ...')), 'pdf'));
test('detects legacy DOC', () =>
    assert.strictEqual(detect('b.doc', Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0])), 'doc'));
test('detects DOCX (zip)', () => assert.strictEqual(detect('c.docx', Buffer.from([0x50, 0x4b, 3, 4, 0, 0])), 'docx'));
test('rejects executables and text renamed to .pdf', () => {
    assert.strictEqual(detect('d.pdf', Buffer.from('MZ\x90\x00 evil')), null);
    assert.strictEqual(detect('e.pdf', Buffer.from('plain text')), null);
});
test('handles empty and tiny files', () => {
    assert.strictEqual(detect('f.pdf', Buffer.alloc(0)), null);
    assert.strictEqual(detect('g.pdf', Buffer.from('%P')), null);
});

console.log(`\n${passed} passed${process.exitCode ? ', with failures' : ''}`);
