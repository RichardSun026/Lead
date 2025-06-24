import React, { useState, useEffect } from 'react';

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

export default function Callender({ realtorId, onSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booked, setBooked] = useState([]);
  const slots = generateSlots();

  const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (!selectedDate || !realtorId) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    console.debug('Fetching booked times for', dateStr);
    fetch(`/api/calendar/${realtorId}/booked?date=${dateStr}`)
      .then((r) => r.json())
      .then((d) => {
        console.debug('Booked times response', d);
        setBooked(d.booked || []);
      })
      .catch(() => setBooked([]));
  }, [selectedDate, realtorId]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  function changeMonth(dir) {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1)
    );
  }

  function selectDate(year, month, day) {
    const d = new Date(year, month, day);
    console.debug('Date selected', d.toISOString().split('T')[0]);
    setSelectedDate(d);
    setSelectedTime(null);
  }

  function renderDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        other: true,
        year: prevYear,
        month: prevMonth,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, other: false, year, month });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    let nextDay = 1;
    while ((cells.length + 7) % 7 !== 0) {
      cells.push({ day: nextDay++, other: true, year: nextYear, month: nextMonth });
    }

    return cells.map((c, idx) => {
      const date = new Date(c.year, c.month, c.day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      const selected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      return (
        <div
          key={idx}
          className={`calendar-day${c.other ? ' other-month' : ''}${
            isToday ? ' today' : ''
          }${selected ? ' selected' : ''}${isPast ? ' past' : ''}`}
          onClick={
            !c.other && !isPast ? () => selectDate(c.year, c.month, c.day) : undefined
          }
        >
          {c.day}
        </div>
      );
    });
  }


  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <div className="calendar-month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button className="calendar-nav" onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {headers.map((h) => (
          <div key={h} className="calendar-day-header">
            {h}
          </div>
        ))}
        {renderDays()}
      </div>
      {selectedDate && (
          <div className="time-slots">
            {slots.map((t) => (
              <button
                key={t}
                className={`time-slot${selectedTime === t ? ' selected' : ''}`}
                disabled={booked.includes(t)}
                onClick={() => {
                  const date = selectedDate.toISOString().split('T')[0];
                  console.debug('Time slot selected', date, t);
                  setSelectedTime(t);
                  onSelect({
                    date,
                    time: t,
                  });
                }}
              >
                {new Date(`1970-01-01T${t}:00`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </button>
            ))}
          </div>
      )}
    </div>
  );
}

