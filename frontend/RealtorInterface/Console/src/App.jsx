import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LeadsList from './LeadsList';
import Report from './Report';

export default function App() {
  return (
    <BrowserRouter basename="/console">
      <Routes>
        <Route path="/" element={<LeadsList />} />
        <Route path="/reports/:phone" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}
