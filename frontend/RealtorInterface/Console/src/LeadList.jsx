import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function fetchLeads() {
      const res = await fetch('/api/leads?uuid=' + encodeURIComponent(localStorage.getItem('realtorUuid') || ''));
      const data = await res.json();
      setLeads(data || []);
    }
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {leads.map((lead) => (
          <Link
            key={lead.phone}
            to={`/reports/${lead.phone}`}
            className="block bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="font-semibold">{lead.name}</div>
            <div className="text-sm text-blue-600">{lead.phone}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
