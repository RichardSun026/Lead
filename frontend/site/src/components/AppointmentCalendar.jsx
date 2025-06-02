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

  return (
    <div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {date && (
        <div className="slots">
          {slots.map((t) => (
            <button
              key={t}
              disabled={booked.includes(t)}
              onClick={() => onSelect({ date, time: t })}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
