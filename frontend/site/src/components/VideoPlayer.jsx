import React from 'react';

/**
 * Render the provided iframe HTML inside a responsive container. The
 * HTML coming from the backend includes inline styles that force the
 * iframe to absolute position itself and fill the page. We strip those
 * styles so the video stays inside the purple placeholder.
 */
export default function VideoPlayer({ html }) {
  if (!html) return <div className="video" />;

  let sanitized = html;
  try {
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const iframe = doc.querySelector('iframe');
      if (iframe) {
        iframe.removeAttribute('style');
        iframe.removeAttribute('width');
        iframe.removeAttribute('height');
        sanitized = iframe.outerHTML;
      }
    } else {
      // Fallback for environments without DOMParser
      sanitized = html
        .replace(/style="[^"]*"/g, '')
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '');
    }
  } catch (err) {
    console.error('Failed to sanitize video HTML', err);
  }

  return <div className="video" dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
