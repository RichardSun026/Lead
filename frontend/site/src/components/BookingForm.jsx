import React, { useState, useEffect } from 'react';

export default function BookingForm({ details, realtorUuid, onBooked, user }) {
  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
    email: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    setForm({
      name: user?.full_name || '',
      phone: user?.phone || '',
      email: '',
    });
  }, [user]);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!details) return;
    setStatus('Submitting...');
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: form.phone,
        full_name: form.name,
        booked_date: details.date,
        booked_time: details.time,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        realtor_id: details.realtorId,
      }),
    });
    if (res.ok) {
      setStatus('Booked!');
      onBooked();
    } else {
      setStatus('Failed');
    }
  };

  if (!details) return null;

  return (
    <form onSubmit={submit} className="booking-form">
      <div className="form-group">
        <input
          className="form-input"
          name="name"
          value={form.name}
          onChange={handle}
          placeholder="Name"
          required
        />
      </div>
      <div className="form-group">
        <input
          className="form-input"
          name="phone"
          value={form.phone}
          onChange={handle}
          placeholder="Phone"
          required
        />
      </div>
      <div className="form-group">
        <input
          className="form-input"
          name="email"
          value={form.email}
          onChange={handle}
          placeholder="Email"
        />
      </div>
      <button type="submit" className="btn-book">
        Confirm {details.date} {details.time}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
