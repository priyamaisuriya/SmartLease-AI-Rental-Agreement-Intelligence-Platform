import React, { useState } from 'react';
import { reminders as initialReminders } from '../data/mockData';
import { Calendar, Bell, Check, X } from 'lucide-react';

const Reminders = () => {
  const [remindersList, setRemindersList] = useState(initialReminders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('Rent Due');

  const icons = { 
    'Rent Due': <Calendar size={18} />, 
    'Agreement Expiry': <FileText size={18} />, 
    'Notice Period': <Bell size={18} />, 
    'Renewal': <Calendar size={18} />, 
    'Deposit Related': <Calendar size={18} />, 
    'Custom Reminder': <Bell size={18} /> 
  };

  const statusBadge = (status) => {
    const css = status === 'Completed' ? 'bg-good-50 text-good-600' : 'bg-lease-50 text-lease-700';
    return (
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${css}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {status}
      </span>
    );
  };

  const completeReminder = (id) => {
    setRemindersList(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  const deleteReminder = (id) => {
    setRemindersList(prev => prev.filter(r => r.id !== id));
  };

  const addReminder = () => {
    const title = newTitle.trim() || 'New reminder';
    const date = newDate || 'No date set';
    const newReminder = { 
      id: 'rem' + Date.now(), 
      type: newType, 
      title, 
      date, 
      related: '—', 
      status: 'Upcoming' 
    };
    setRemindersList(prev => [newReminder, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDate('');
  };

  return (
    <div className="fade-in relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Reminders</h1>
          <p className="mt-1 text-sm text-ink-soft">Rent, deadlines, and renewals — all in one timeline.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="rounded-lg bg-lease-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-lease-700">
          + Add Reminder
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {remindersList.length > 0 ? remindersList.map(r => (
          <div key={r.id} className="flex items-start gap-4 rounded-xl2 border border-line bg-surface p-5 shadow-soft">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${r.status === 'Completed' ? 'bg-good-50 text-good-600' : 'bg-lease-50 text-lease-600'}`}>
              <Bell size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-ink">{r.title}</p>
                {statusBadge(r.status)}
              </div>
              <p className="mt-1 text-xs text-ink-faint">{r.type} · {r.date} · {r.related}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {r.status !== 'Completed' && (
                <button onClick={() => completeReminder(r.id)} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas">Mark Done</button>
              )}
              <button onClick={() => deleteReminder(r.id)} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-bad-600 hover:bg-bad-50">Delete</button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lease-50 text-lease-600">
              <Calendar size={20} />
            </span>
            <p className="font-display text-base font-semibold text-ink">No reminders yet</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink-faint">Add a reminder to stay on top of rent, notices, and renewals.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/30 p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="w-full max-w-md rounded-xl2 bg-surface p-6 shadow-lift animate-popIn">
            <p className="font-display text-base font-semibold text-ink">Add reminder</p>
            <div className="mt-4 space-y-3">
              <input 
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="Reminder title" 
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none" 
              />
              <input 
                value={newDate} onChange={(e) => setNewDate(e.target.value)} 
                type="date" 
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none" 
              />
              <select 
                value={newType} onChange={(e) => setNewType(e.target.value)} 
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none"
              >
                <option>Rent Due</option>
                <option>Agreement Expiry</option>
                <option>Notice Period</option>
                <option>Renewal</option>
                <option>Deposit Related</option>
                <option>Custom Reminder</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-canvas">Cancel</button>
              <button onClick={addReminder} className="rounded-lg bg-lease-600 px-4 py-2 text-sm font-medium text-white hover:bg-lease-700">Add Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple stub for FileText icon used in dictionary
const FileText = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default Reminders;
