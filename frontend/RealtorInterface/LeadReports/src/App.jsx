import React, { useEffect, useState } from 'react';

export default function App() {
  const [report, setReport] = useState(null);
  const phone = window.location.pathname.split('/').pop();

  useEffect(() => {
    async function fetchReport() {
      const res = await fetch(`/api/reports/${encodeURIComponent(phone)}`);
      const data = await res.json();
      setReport(data);
    }
    fetchReport();
  }, [phone]);

  if (!report) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Lead Report</h1>
      <p><strong>Name:</strong> {report.name || 'N/A'}</p>
      <p><strong>Phone:</strong> {report.phone}</p>
      <p><strong>Address:</strong> {report.address || 'N/A'}</p>
      <p><strong>Zipcode:</strong> {report.zipcode || 'N/A'}</p>
      <h2>Survey Summary</h2>
      <p>{report.surveySummary || 'No survey data'}</p>
      <h2>Message Summary</h2>
      <p>{report.messageSummary || 'No messages'}</p>
    </div>
  );
}
