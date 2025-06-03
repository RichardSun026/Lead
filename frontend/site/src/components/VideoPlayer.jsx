import React from 'react';

export default function VideoPlayer({ html }) {
  if (!html) return null;
  return <div className="video" dangerouslySetInnerHTML={{ __html: html }} />;
}
