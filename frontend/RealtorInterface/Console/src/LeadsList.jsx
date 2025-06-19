import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LeadsList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('leads').select('phone,first_name,last_name,address');
      setLeads(data || []);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6">
      <div className="container mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div className="header bg-gradient-to-r from-slate-700 to-blue-500 text-white p-6 relative">
          <Settings className="settings-cog absolute left-4 top-4 w-6 h-6" />
          <h1 className="title text-2xl font-bold text-center">Leads Console</h1>
        </div>
        <div className="content p-6 grid gap-4">
          {leads.map((lead) => (
            <Link
              key={lead.phone}
              to={`reports/${encodeURIComponent(lead.phone)}`}
              className="lead-card block bg-white rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {lead.first_name} {lead.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{lead.address}</div>
                </div>
                <div className="font-mono text-blue-600">{lead.phone}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
