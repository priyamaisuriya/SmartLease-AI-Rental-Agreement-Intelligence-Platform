import React, { useState } from 'react';
import { Bell, PlusCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { landlordReminders } from '../../data/landlordMockData';

const Reminders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = landlordReminders.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Reminders</h1>
          <p className="text-ink-soft mt-1">Manage important dates, deadlines, and property maintenance.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reminders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-canvas border border-line rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-canvas border border-line rounded-lg text-sm font-medium text-ink hover:bg-line/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-line">
          {filteredData.length > 0 ? filteredData.map(rem => (
            <div key={rem.id} className="p-6 hover:bg-canvas/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                  ${rem.type === 'Rent' ? 'bg-warn-50 text-warn-600' : 
                    rem.type === 'Agreement' ? 'bg-lease-50 text-lease-600' : 
                    'bg-signal-50 text-signal-600'}`
                }>
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-ink">{rem.title}</h3>
                  <p className="text-sm text-ink-soft mt-1">{rem.property}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-canvas border border-line text-ink-soft">
                      {rem.type}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-warn-600">
                      <Clock className="w-4 h-4" />
                      Due: {rem.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:pl-16">
                <button className="flex items-center gap-2 px-4 py-2 bg-canvas border border-line text-ink rounded-lg text-sm font-medium hover:bg-line/50 transition-colors">
                  Edit
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-good-50 text-good-700 border border-good-500/20 rounded-lg text-sm font-medium hover:bg-good-100 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-ink-soft">
              No reminders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
