import React, { useEffect } from 'react';
import logo from '/Logo.png';

export default function App() {
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.section').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header>
        <div className="container">
          <div className="header-content">
            <img src={logo} alt="My Real Evaluation Logo" className="logo-img" />
          </div>
        </div>
      </header>
    
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>Smarter Real Estate Leads, Powered by AI</h1>
                    <p>Connect with motivated sellers through the most intelligent and efficient lead generation platform built for realtors.</p>
                    <a href="http://134.199.198.237:4175/" className="cta-button">Get Started – Realtor Sign-Up</a>
                </div>
            </div>
        </section>
    
        <section className="section what-we-do">
            <div className="container">
                <h2 className="section-title">Helping You Connect With Homeowners Ready to Sell</h2>
                <div className="section-content">
                    <p>At My Real Evaluation, we run high-converting online ads that offer free home evaluations to homeowners. Once they respond, our AI system engages with them directly, asks smart questions, and filters out the real prospects. We then hand off verified, high-intent leads to real estate agents like you.</p>
                </div>
            </div>
        </section>
    
        <section className="section why-different">
            <div className="container">
                <h2 className="section-title">Not Just More Leads. Better Ones.</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🤖</span>
                        <h3 className="feature-title">AI-Powered Conversations</h3>
                        <p className="feature-description">Every lead is pre-qualified by AI-driven chats that collect detailed data and gauge real interest.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔍</span>
                        <h3 className="feature-title">Advanced Filtration System</h3>
                        <p className="feature-description">Our custom filtration tools eliminate low-quality leads, so you waste no time chasing dead ends.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📊</span>
                        <h3 className="feature-title">Full Transparency</h3>
                        <p className="feature-description">Access real-time conversations and lead information through our secure dashboard.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📈</span>
                        <h3 className="feature-title">Weekly Performance Reports</h3>
                        <p className="feature-description">Stay informed with automatic insights on ad performance and your top prospects.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <h3 className="feature-title">Secure Database Access</h3>
                        <p className="feature-description">Leads are stored safely, and you can review every detail at your convenience.</p>
                    </div>
                </div>
            </div>
        </section>
    
        <section className="section how-it-works">
            <div className="container">
                <h2 className="section-title">A Seamless Process That Works For You</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3 className="step-title">We Run & Optimize Ads</h3>
                        <p className="step-description">We run and optimize high-converting ads that attract motivated homeowners.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3 className="step-title">AI Qualifies Leads</h3>
                        <p className="step-description">AI chats with interested homeowners to evaluate intent and gather key information.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3 className="step-title">Leads Delivered</h3>
                        <p className="step-description">Qualified leads are passed directly to your secure dashboard for immediate action.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h3 className="step-title">Track Everything</h3>
                        <p className="step-description">You track everything—live conversations, lead history, and performance results.</p>
                    </div>
                </div>
            </div>
        </section>
    
        <section className="final-cta">
            <div className="container">
                <h2>Ready to grow your business with smarter leads?</h2>
                <a href="http://134.199.198.237:4175/" className="cta-button">Get Started – Realtor Sign-Up</a>
            </div>
        </section>
    
    </>
  );
}
