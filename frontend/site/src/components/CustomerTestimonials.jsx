import React from 'react';

const testimonials = [
  {
    name: 'Sarah J.',
    rating: 5,
    text: 'Absolutely incredible service! Highly recommend.'
  },
  {
    name: 'Michael T.',
    rating: 4,
    text: 'Very professional and knowledgeable.'
  },
  {
    name: 'Jessica R.',
    rating: 5,
    text: 'Top-notch expertise and responsiveness.'
  },
];

export default function CustomerTestimonials() {
  return (
    <section className="testimonials-section">
      <h3>Customer Testimonials</h3>
      <div className="testimonials-container">
        {testimonials.map((t, i) => (
          <div className="testimonial-card" key={i}>
            <div className="testimonial-name">{t.name}</div>
            <div className="testimonial-rating">
              {'\u2605'.repeat(t.rating) + '\u2606'.repeat(5 - t.rating)}
            </div>
            <div className="testimonial-text">{t.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
