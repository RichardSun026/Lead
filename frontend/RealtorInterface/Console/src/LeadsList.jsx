import React from 'react';
import { Link } from 'react-router-dom';

const leads = [
  { name: 'Michael Rodriguez', phone: '5551234567', zipcode: '90210', status: 'booked', datetime: 'Jun 19, 2025 • 2:30 PM' },
  { name: 'Jennifer Chen', phone: '5559876543', zipcode: '10001', status: 'booked', datetime: 'Jun 20, 2025 • 10:15 AM' },
  { name: 'David Thompson', phone: '5554567890', zipcode: '73301', status: 'booked', datetime: 'Jun 21, 2025 • 4:45 PM' },
  { name: 'Amanda Foster', phone: '5553210987', zipcode: '60601', status: 'hot' },
  { name: 'Robert Kim', phone: '5556543210', zipcode: '33101', status: 'hot' },
  { name: 'Lisa Martinez', phone: '5557890123', zipcode: '94102', status: 'hot' },
  { name: 'James Wilson', phone: '5550123456', zipcode: '02101', status: 'hot' },
  { name: 'Maria Garcia', phone: '5553456789', zipcode: '85001', status: 'hot' },
];

export default function LeadsList() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Leads Console</h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leads.map((lead) => (
            <Link
              key={lead.phone}
              to={`/reports/${encodeURIComponent(lead.phone)}`}
              className={`lead-card rounded-xl p-4 bg-white/20 backdrop-blur hover:bg-white/30 transition-colors block`}
            >
              <div className="space-y-1">
                <div className="font-semibold text-lg">{lead.name}</div>
                <div className="text-sm">{lead.phone}</div>
                <div className="text-sm">{lead.zipcode}</div>
                {lead.datetime && <div className="text-sm">{lead.datetime}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
