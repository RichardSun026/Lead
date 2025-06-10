import React, { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name: '', email: '', phone: '' });
  const [realtor, setRealtor] = useState(null);
  const [password, setPassword] = useState('');

  const handleFirstSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/realtor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    const data = await res.json();
    setRealtor(data);
    setStep(2);
  };

  const handleCalendarLink = async () => {
    if (!realtor) return;
    const res = await fetch(`/api/calendar/oauth/${realtor.realtor_id}`);
    const json = await res.json();
    window.location.href = json.url;
  };

  const handleSecondSubmit = (e) => {
    e.preventDefault();
    alert('Onboarding complete!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      {step === 1 && (
        <form onSubmit={handleFirstSubmit}>
          <h2>Step 1: Your Information</h2>
          <p>Please provide your details to create your account.</p>
          <input
            type="text"
            placeholder="Full name"
            value={info.name}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
            required
          />
          <br />
          <input
            type="email"
            placeholder="Email"
            value={info.email}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
          />
          <br />
          <input
            type="text"
            placeholder="Phone"
            value={info.phone}
            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            required
          />
          <br />
          <button type="submit">Submit</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSecondSubmit}>
          <h2>Step 2: Connect Calendar</h2>
          <p>
            Click the button below to link your Google Calendar. Make sure you are
            logged into the correct Google account. If you encounter any issues,
            try using an incognito window or another browser.
          </p>
          <button type="button" onClick={handleCalendarLink}>
            Connect Google Calendar
          </button>
          <p>
            After granting access you will be redirected back here. Set a
            temporary password below to finish your setup.
          </p>
          <input
            type="password"
            placeholder="Temporary Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button type="submit">Finish</button>
        </form>
      )}
    </div>
  );
}
