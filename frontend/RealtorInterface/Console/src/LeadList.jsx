import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setLeads(data);
      } catch {
        // fallback sample data
        setLeads([
          { name: 'Michael Rodriguez', phone: '5551234567', zipcode: '90210', time: 'Jun 19, 2025 • 2:30 PM', booked: true },
          { name: 'Jennifer Chen', phone: '5559876543', zipcode: '10001', time: 'Jun 20, 2025 • 10:15 AM', booked: true },
          { name: 'David Thompson', phone: '5554567890', zipcode: '73301', time: 'Jun 21, 2025 • 4:45 PM', booked: true },
        ]);
      }
    }
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="container mx-auto bg-white/95 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-blue-500 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">Sarah Johnson Returns!</h1>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">First Booked Leads</h2>
          <div className="space-y-4">
            {leads.map((lead) => (
              <Link
                key={lead.phone}
                to={`/reports/${encodeURIComponent(lead.phone)}`}
                className="block bg-white rounded-lg border-l-4 border-blue-500 shadow hover:shadow-lg p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-sm text-blue-600">{lead.phone}</div>
                  </div>
                  <div className="text-sm text-gray-600">{lead.time}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
