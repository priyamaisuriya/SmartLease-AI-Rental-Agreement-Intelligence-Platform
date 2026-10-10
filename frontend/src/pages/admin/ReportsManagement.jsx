import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'properties', label: 'Properties' },
  { id: 'rentals', label: 'Rentals & Payments' },
  { id: 'agreements', label: 'Agreements' },
  { id: 'ai', label: 'AI Usage' },
  { id: 'reminders', label: 'Rent Reminders' },
  { id: 'monthly', label: 'Monthly Trend' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CURRENCY_HINT = /(rent|deposit|amount|revenue|income|total.*paid)/i;

const prettify = (key) =>
  String(key)
    .replace(/^_+/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_.]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') {
    const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
    return CURRENCY_HINT.test(key) ? `₹${rounded.toLocaleString('en-IN')}` : rounded.toLocaleString('en-IN');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

// Flatten nested objects: { a: { b: 1 } } -> { 'a.b': 1 }
const flatten = (obj, prefix = '', out = {}) => {
  Object.entries(obj || {}).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      flatten(v, key, out);
    } else if (!Array.isArray(v)) {
      out[key] = v;
    }
  });
  return out;
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// Merge the monthly series ({ users: [{_id:{year,month},count}], ... }) into rows per month.
const buildMonthlyRows = (data) => {
  const rows = {};
  const series = Object.keys(data || {}).filter((k) => Array.isArray(data[k]));

  series.forEach((name) => {
    data[name].forEach((item) => {
      const y = item?._id?.year;
      const m = item?._id?.month;
      if (!y || !m) return;
      const id = `${y}-${String(m).padStart(2, '0')}`;
      rows[id] = rows[id] || { Month: `${MONTHS[m - 1]} ${y}`, _sort: id };
      rows[id][prettify(name)] = item.count ?? 0;
    });
  });

  const columns = ['Month', ...series.map(prettify)];
  const list = Object.values(rows)
    .sort((a, b) => a._sort.localeCompare(b._sort))
    .map((r) => {
      const full = { ...r };
      columns.forEach((c) => {
        if (full[c] === undefined) full[c] = 0;
      });
      return full;
    });

  return { columns, rows: list };
};

const StatCards = ({ values }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {Object.entries(values).map(([k, v]) => (
      <div key={k} className="bg-paper border border-border rounded-lg p-4">
        <div className="text-xs uppercase tracking-wide text-text-muted">{prettify(k.split('.').pop())}</div>
        <div className="text-2xl font-semibold text-ink mt-1">{formatValue(k, v)}</div>
      </div>
    ))}
  </div>
);

const TableBlock = ({ rows }) => {
  const flat = rows.map((r) => (isPlainObject(r) ? flatten(r) : { value: r }));
  const columns = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
  if (flat.length === 0) return <p className="text-sm text-text-muted">No data yet.</p>;
  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-text-muted text-xs uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2">{prettify(c.replace(/^_id\.?/, '') || 'Name')}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {flat.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c} className="px-4 py-2">{formatValue(c, r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Renders any report payload: numbers become stat cards, arrays become tables.
const ReportBody = ({ data }) => {
  if (!isPlainObject(data)) return null;

  const scalars = {};
  const sections = [];

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      sections.push({ title: key, rows: value });
    } else if (isPlainObject(value)) {
      const flat = flatten(value);
      const arrays = Object.entries(value).filter(([, v]) => Array.isArray(v));
      sections.push({ title: key, values: flat });
      arrays.forEach(([k, v]) => sections.push({ title: `${key} ${k}`, rows: v }));
    } else {
      scalars[key] = value;
    }
  });

  return (
    <div className="space-y-8">
      {Object.keys(scalars).length > 0 && <StatCards values={scalars} />}
      {sections.map((s) => (
        <section key={s.title}>
          <h3 className="text-sm font-semibold text-ink mb-3">{prettify(s.title)}</h3>
          {s.values ? (
            Object.keys(s.values).length ? <StatCards values={s.values} /> : <p className="text-sm text-text-muted">No data yet.</p>
          ) : (
            <TableBlock rows={s.rows} />
          )}
        </section>
      ))}
    </div>
  );
};

const toCsv = (tab, data) => {
  const lines = [['Section', 'Item', 'Value']];
  if (tab === 'monthly') {
    const { columns, rows } = buildMonthlyRows(data);
    return [columns, ...rows.map((r) => columns.map((c) => r[c]))].map((r) => r.map(csvCell).join(',')).join('\n');
  }
  Object.entries(data || {}).forEach(([section, value]) => {
    if (Array.isArray(value)) {
      value.forEach((row) => {
        const flat = isPlainObject(row) ? flatten(row) : { value: row };
        lines.push([section, '', JSON.stringify(flat)]);
      });
    } else if (isPlainObject(value)) {
      Object.entries(flatten(value)).forEach(([k, v]) => lines.push([section, k, v]));
    } else {
      lines.push(['summary', section, value]);
    }
  });
  return lines.map((r) => r.map(csvCell).join(',')).join('\n');
};

const ReportsManagement = () => {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/reports/${tab}`);
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(err.response?.data?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(tab, data)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthly = tab === 'monthly' && data ? buildMonthlyRows(data) : null;

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Reports</h1>
          <p className="text-text-muted mt-1">Live platform reports computed from current data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              tab === t.id
                ? 'bg-lease-600 text-white border-lease-600'
                : 'bg-white text-ink border-border hover:bg-paper'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm p-6">
        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : error ? (
          <p className="text-risk-red">{error}</p>
        ) : monthly ? (
          <TableBlock rows={monthly.rows.map(({ _sort, ...rest }) => rest)} />
        ) : (
          <ReportBody data={data} />
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;
