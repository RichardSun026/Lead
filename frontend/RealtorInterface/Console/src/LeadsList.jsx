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
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data || []);
    }
    load();
  }, []);

  useEffect(() => {
    async function initAuth() {
      if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          window.location.hash = '';
        }
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }

    initAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://www.myrealvaluation.com/console/' },
    });
    setEmailSent(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const filteredLeads = leads.filter((lead) =>
    `${lead.first_name} ${lead.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-sm">
          {emailSent ? (
            <p className="text-center">Check your email ({email}) for a login link.</p>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <h1 className="text-xl font-bold text-center">Login</h1>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border rounded p-2"
              />
              <button type="submit" className="w-full bg-blue-600 text-white rounded p-2">
                Send Magic Link
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6">
      <div className="container mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        <div className="header bg-gradient-to-r from-slate-700 to-blue-500 text-white p-6 relative">
          <Settings
            className="settings-cog absolute left-4 top-4 w-6 h-6 cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div className="absolute left-2 top-10 bg-white text-sm rounded shadow p-3 w-40">
              <div className="mb-2 text-gray-700 break-words">{session.user.email}</div>
              <button onClick={handleLogout} className="text-red-600 hover:underline">
                Log Out
              </button>
            </div>
          )}
          <h1 className="title text-2xl font-bold text-center">Leads Console</h1>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="absolute right-4 top-4 rounded px-2 py-1 text-black w-40"
          />
        </div>
        <div className="content p-6 grid gap-4">
          {filteredLeads.map((lead) => (
            <Link
              key={lead.phone}
              to={`reports/${encodeURIComponent(lead.phone)}`}
              className="lead-card block bg-white rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">
                    {lead.first_name} {lead.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{lead.zipcode}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-blue-600">{lead.phone}</div>
                  <div className="text-xs capitalize text-gray-500">
                    {lead.lead_state}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
