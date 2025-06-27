import React, { useState, useEffect } from 'react';

export default function BookingForm({ details, onBooked, user }) {
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
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('55')) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);
    let out = '';
    if (digits.length > 0) out += '(' + digits.slice(0, Math.min(2, digits.length));
    if (digits.length >= 3) out += ') ';
    const rest = digits.slice(2);
    if (rest.length > 4) {
      out += rest.slice(0, rest.length - 4) + '-' + rest.slice(-4);
    } else {
      out += rest;
    }
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
      setStatus('Nome e telefone são obrigatórios');
      return;
    }

    console.debug('Submitting booking', {
      ...form,
      date: details.date,
      time: details.time,
    });

    setStatus('Enviando...');
    const res = await fetch('/api/bookings', {
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
      setStatus('Agendado!');
      onBooked();
    } else {
      setStatus('Falha');
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
          placeholder="Nome"
          required
        />
      </div>
      <div className="form-group">
        <input
          className="form-input"
          name="phone"
          value={form.phone}
          onChange={handle}
          placeholder="Telefone"
          inputMode="tel"
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          maxLength="15"
          required
        />
      </div>
      <button type="submit" className="btn-book">
        Confirmar {details.date} {details.time}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
