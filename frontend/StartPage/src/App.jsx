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
            <img src={logo} alt="Logotipo da My Real Evaluation" className="logo-img" />
          </div>
        </div>
      </header>
    
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>Leads imobiliários mais inteligentes, impulsionados por IA</h1>
                    <p>Conecte-se com vendedores motivados através da plataforma de geração de leads mais inteligente e eficiente, feita para corretores.</p>
                    <a href="/onboarding" className="cta-button">Comece agora – Cadastro do Corretor</a>
                </div>
            </div>
        </section>
    
        <section className="section what-we-do">
            <div className="container">
                <h2 className="section-title">Ajudando você a se conectar com proprietários prontos para vender</h2>
                <div className="section-content">
                    <p>Na My Real Evaluation, executamos anúncios online de alta conversão que oferecem avaliações gratuitas de imóveis aos proprietários. Assim que respondem, nosso sistema de IA interage diretamente, faz perguntas inteligentes e filtra os verdadeiros interessados. Depois encaminhamos leads verificados e com alta intenção para corretores como você.</p>
                </div>
            </div>
        </section>
    
        <section className="section why-different">
            <div className="container">
                <h2 className="section-title">Não apenas mais leads. Leads melhores.</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🤖</span>
                        <h3 className="feature-title">Conversas impulsionadas por IA</h3>
                        <p className="feature-description">Cada lead é pré-qualificado por chats com IA que coletam dados detalhados e avaliam o interesse real.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔍</span>
                        <h3 className="feature-title">Sistema avançado de filtragem</h3>
                        <p className="feature-description">Nossas ferramentas personalizadas de filtragem eliminam leads de baixa qualidade para que você não perca tempo com casos sem futuro.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📊</span>
                        <h3 className="feature-title">Transparência total</h3>
                        <p className="feature-description">Acesse conversas em tempo real e informações de leads através do nosso painel seguro.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📈</span>
                        <h3 className="feature-title">Relatórios semanais de desempenho</h3>
                        <p className="feature-description">Mantenha-se informado com insights automáticos sobre o desempenho dos anúncios e seus principais prospects.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <h3 className="feature-title">Acesso seguro ao banco de dados</h3>
                        <p className="feature-description">Leads são armazenados com segurança e você pode revisar cada detalhe quando quiser.</p>
                    </div>
                </div>
            </div>
        </section>
    
        <section className="section how-it-works">
            <div className="container">
                <h2 className="section-title">Um processo sem complicações que funciona para você</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3 className="step-title">Executamos e otimizamos anúncios</h3>
                        <p className="step-description">Executamos e otimizamos anúncios de alta conversão que atraem proprietários motivados.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3 className="step-title">IA qualifica os leads</h3>
                        <p className="step-description">A IA conversa com os proprietários interessados para avaliar intenção e coletar informações essenciais.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3 className="step-title">Leads entregues</h3>
                        <p className="step-description">Leads qualificados são enviados diretamente para o seu painel seguro para ação imediata.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h3 className="step-title">Acompanhe tudo</h3>
                        <p className="step-description">Você acompanha tudo — conversas ao vivo, histórico de leads e resultados de desempenho.</p>
                    </div>
                </div>
            </div>
        </section>
    
        <section className="final-cta">
            <div className="container">
                <h2>Pronto para fazer seu negócio crescer com leads mais inteligentes?</h2>
                <a href="/onboarding" className="cta-button">Comece agora – Cadastro do Corretor</a>
            </div>
        </section>
    
    </>
  );
}
