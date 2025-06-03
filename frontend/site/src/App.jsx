import React, { useEffect, useState } from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import Callender from './components/Callender';
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
    console.debug('Parsed path parts', parts);
    if (parts.length < 1) {
      setError('Missing realtor id');
      setLoading(false);
      return;
    }
    const uuid = parts[0];
    console.debug('Detected realtor uuid', uuid);
    setRealtorUuid(uuid);

    fetch(`/api/realtor?uuid=${uuid}`)
      .then((r) => {
        console.debug('Realtor fetch status', r.status);
        return r.json();
      })
      .then((data) => {
        console.debug('Realtor fetch response', data);
        setRealtor(data);
      })
      .catch((err) => {
        console.error('Failed to load realtor', err);
        setError('Failed to load realtor');
      })
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
    <>
      <header className="header">
        <h1>Thank you for filling out the survey!</h1>
        <p>
          IMPORTANT!
          <br />
          PLEASE WATCH THIS SHORT 1 MINUTE VIDEO
        </p>
      </header>

      <div className="video-section">
        <VideoPlayer html={realtor.video_url} />
      </div>

      <div className="contact-section">
        <div className="contact-text">MY TEAM WILL BE IN CONTACT SHORTLY</div>
        <div className="skip-text">
          OR Skip the line and schedule a call with me NOW
        </div>
        <div className="calendar-section">
          <Callender
            realtorId={realtor.realtorId}
            onSelect={(sel) =>
              setSelection({ ...sel, realtorId: realtor.realtorId })
            }
          />
          <BookingForm
            details={selection}
            realtorUuid={realtorUuid}
            onBooked={() => setSelection(null)}
            user={user}
          />
        </div>
        <div className="buttons">
          <button
            className="btn btn-testimonials"
            onClick={() => alert('Coming soon!')}
          >
            ⭐ Customer Testimonials
          </button>
          {realtor.website_url && (
            <a
              href={realtor.website_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-website"
            >
              🌐 Visit My Website!
            </a>
          )}
        </div>
      </div>
      </>
  );
}
