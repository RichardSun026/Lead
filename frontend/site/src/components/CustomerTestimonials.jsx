import React from 'react';

const testimonials = [
  {
    name: 'Sarah J.',
    rating: 5,
    text: 'Serviço absolutamente incrível! Recomendo muito.'
  },
  {
    name: 'Michael T.',
    rating: 4,
    text: 'Muito profissional e experiente.'
  },
  {
    name: 'Jessica R.',
    rating: 5,
    text: 'Especialização e agilidade de primeira linha.'
  },
];

export default function CustomerTestimonials() {
  return (
    <section className="testimonials-section">
      <h3>Depoimentos de Clientes</h3>
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
