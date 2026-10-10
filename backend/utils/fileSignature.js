const fs = require('fs');

// Detects pdf / doc / docx from the file's leading bytes rather than trusting
// the client-supplied filename or MIME type. Returns null for anything else.
const detectDocumentType = (filePath) => {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(8);

    try {
        fs.readSync(fd, buf, 0, 8, 0);
    } finally {
        fs.closeSync(fd);
    }

    if (buf.slice(0, 5).toString('latin1') === '%PDF-') {
        return 'pdf';
    }

    // OLE2 compound file (legacy .doc)
    if (buf.slice(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) {
        return 'doc';
    }

    // ZIP container (.docx)
    if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
        return 'docx';
    }

    return null;
};

const removeFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        // already gone
    }
};

module.exports = { detectDocumentType, removeFile };
