import React, { useEffect, useState } from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import AppointmentCalendar from './components/AppointmentCalendar';
import BookingForm from './components/BookingForm';

export default function App() {
  const [realtor, setRealtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [user, setUser] = useState(null);
  const [realtorUuid, setRealtorUuid] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 1) {
      setError('Missing realtor id');
      setLoading(false);
      return;
    }
    const uuid = parts[0];
    setRealtorUuid(uuid);

    fetch(`/api/realtor?uuid=${uuid}`)
      .then((r) => r.json())
      .then(setRealtor)
      .catch(() => setError('Failed to load realtor'))
      .finally(() => setLoading(false));

    const tracking = url.searchParams.get('utm_source');
    if (tracking) {
      fetch(`/api/user?tracking=${tracking}`)
        .then((r) => r.json())
        .then(setUser)
        .catch(() => {});
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!realtor) return <p>No realtor found</p>;

  return (
    <div className="container">
      <VideoPlayer html={realtor.video_url} />
      <AppointmentCalendar
        realtorId={realtor.realtorId}
        onSelect={(sel) => setSelection({ ...sel, realtorId: realtor.realtorId })}
      />
      <BookingForm
        details={selection}
        realtorUuid={realtorUuid}
        onBooked={() => setSelection(null)}
        user={user}
      />
    </div>
  );
}
