import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('first_name,last_name,phone,address')
        .order('created_at', { ascending: false });
      if (!error) setLeads(data || []);
    }
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6">Your Leads</h1>
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Link
              to={`/reports/${encodeURIComponent(lead.phone)}`}
              key={lead.phone}
              className="block bg-white text-gray-800 rounded-xl p-4 hover:bg-gray-100"
            >
              <div className="font-medium">
                {lead.first_name} {lead.last_name}
              </div>
              <div className="text-sm text-gray-500">{lead.phone}</div>
              {lead.address && (
                <div className="text-sm text-gray-400">{lead.address}</div>
              )}
            </Link>
          ))}
          {leads.length === 0 && (
            <div className="text-center text-gray-200">No leads yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
