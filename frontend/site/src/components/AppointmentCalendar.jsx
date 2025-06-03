import React, { useEffect, useState } from 'react';

function generateSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

export default function AppointmentCalendar({ realtorId, onSelect }) {
  const [date, setDate] = useState('');
  const [booked, setBooked] = useState([]);
  const slots = generateSlots();

  useEffect(() => {
    if (!date || !realtorId) return;
    fetch(`/api/calendar/${realtorId}/booked?date=${date}`)
      .then((r) => r.json())
      .then((d) => setBooked(d.booked || []))
      .catch(() => setBooked([]));
  }, [date, realtorId]);

  const format = (t) =>
    new Date(`1970-01-01T${t}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="calendar">
      <input
        className="date-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {date && (
        <div className="time-slots">
          {slots.map((t) => (
            <button
              key={t}
              className="time-slot"
              disabled={booked.includes(t)}
              onClick={() => onSelect({ date, time: t })}
            >
              {format(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
