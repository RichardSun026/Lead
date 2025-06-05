import React, { useState, useEffect } from 'react';

export default function BookingForm({ details, realtorUuid, onBooked, user }) {
  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    setForm({
      name: user?.full_name || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    let out = '';
    if (digits.length > 0) out += '(' + digits.slice(0, 3);
    if (digits.length >= 4) out += ') ' + digits.slice(3, 6);
    if (digits.length >= 7) out += '-' + digits.slice(6, 10);
    return out;
  };

  const handle = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      value = formatPhone(value);
    }
    const updated = { ...form, [e.target.name]: value };
    console.debug('Form updated', updated);
    setForm(updated);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!details) return;

    if (!form.name || !form.phone) {
      console.debug('Attempted booking with missing fields', form);
      setStatus('Name and phone are required');
      return;
    }

    console.debug('Submitting booking', {
      ...form,
      date: details.date,
      time: details.time,
    });

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
    console.debug('Booking response status', res.status);

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
          inputMode="tel"
          pattern="\(\d{3}\) ?\d{3}-\d{4}"
          maxLength="14"
          required
        />
      </div>
      <button type="submit" className="btn-book">
        Confirm {details.date} {details.time}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
