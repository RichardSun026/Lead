import React, { useEffect, useState } from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import Callender from './components/Callender';
import BookingForm from './components/BookingForm';
import CustomerTestimonials from './components/CustomerTestimonials';

export default function App() {
  const [realtor, setRealtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [user, setUser] = useState(null);
  const [realtorId, setRealtorId] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    let out = '';
    if (digits.length > 0) out += '(' + digits.slice(0, 3);
    if (digits.length >= 4) out += ') ' + digits.slice(3, 6);
    if (digits.length >= 7) out += '-' + digits.slice(6, 10);
    return out;
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts[0] === 's' ? 1 : 0;
    console.debug('Parsed path parts', parts, 'using idx', idx);
    if (parts.length - idx < 1) {
      setError('Missing realtor id');
      setLoading(false);
      return;
    }
    const id = parts[idx];
    console.debug('Detected realtor id', id);
    setRealtorId(id);

    if (parts.length - idx >= 2) {
      const rawPhone = decodeURIComponent(parts[idx + 1]);
      const formattedPhone = formatPhone(rawPhone);
      setUser({ phone: formattedPhone });
      fetch(`/api/user?phone=${formattedPhone}`)
        .then((r) => r.json())
        .then((d) => setUser((prev) => ({ ...prev, ...d })))
        .catch(() => {});
    } else {
      const tracking = url.searchParams.get('utm_source');
      if (tracking) {
        fetch(`/api/user?tracking=${tracking}`)
          .then((r) => r.json())
          .then(setUser)
          .catch(() => {});
      }
    }

    fetch(`/api/realtor?realtorId=${id}`)
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
  }, []);

  // Removed the scheduled reminder text message

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
            onBooked={() => {
              console.debug('Booking confirmed', selection);
              setSelection(null);
              setBookingConfirmed(true);
              if (selection) {
                alert(
                  `Thank you for booking a meeting with ${realtor.name} at ${selection.date} ${selection.time}. ${realtor.name} will soon enter contact with you.`,
                );
              }
            }}
            user={user}
          />
        </div>
        <div className="buttons">
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
      <CustomerTestimonials />
    </>
  );
}
