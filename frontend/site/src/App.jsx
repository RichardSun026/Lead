import { useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const [realtor, setRealtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      setError('Missing realtor id or user marker');
      setLoading(false);
      return;
    }
    const realtorId = parts[0];
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
