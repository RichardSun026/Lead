import { useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const [realtor, setRealtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [realtorUuid, setRealtorUuid] = useState('');
  const [tracking, setTracking] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      setError('Missing realtor id or user marker');
      setLoading(false);
      return;
    }
    const realtorId = parts[0];
    setRealtorUuid(realtorId);
    setTracking(url.search.substring(1));
    // fetch realtor info from backend
    fetch(`/api/realtor?uuid=${realtorId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch realtor');
        return res.json();
      })
      .then((data) => {
        setRealtor(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load realtor information');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setStatus('Please fill in all fields.');
      return;
    }
    setStatus('Submitting...');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          realtorUuid,
          tracking,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('Thank you!');
      setForm({ name: '', phone: '', email: '' });
    } catch {
      setStatus('Submission failed.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!realtor) {
    return <div>No realtor found.</div>;
  }

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
        {status && <p>{status}</p>}
      </form>
      <div className="video" dangerouslySetInnerHTML={{ __html: realtor.video_url }} />
      {realtor.calendar_id && (
        <div className="calendar">
          <iframe
            src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
              realtor.calendar_id
            )}&mode=AGENDA`}
            title="Booking Calendar"
          />
        </div>
      )}
    </div>
  );
}
