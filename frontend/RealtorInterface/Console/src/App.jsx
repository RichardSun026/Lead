import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LeadList from './LeadList.jsx';
import Report from './Report.jsx';

export default function App() {
  return (
    <BrowserRouter basename="/console">
      <Routes>
        <Route index element={<LeadList />} />
        <Route path="reports/:phone" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}
