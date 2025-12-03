import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

// Icons as SVG components
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const BrainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
  </svg>
);

const TargetIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ChartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    // Handle navbar background on scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const features = [
    {
      icon: <BrainIcon />,
      title: 'AI-Powered Tutoring',
      description: 'Get personalized explanations and instant feedback from our advanced AI tutor, available 24/7 to help you master any concept.'
    },
    {
      icon: <TargetIcon />,
      title: 'Smart Goal Tracking',
      description: 'Set learning objectives and track your progress with intelligent insights that adapt to your pace and learning style.'
    },
    {
      icon: <UsersIcon />,
      title: 'Peer Collaboration',
      description: 'Connect with fellow learners, share knowledge through peer reviews, and grow together in a supportive community.'
    },
    {
      icon: <TrophyIcon />,
      title: 'Gamified Challenges',
      description: 'Earn points, climb leaderboards, and unlock achievements as you complete engaging coding challenges and quizzes.'
    },
    {
      icon: <ChartIcon />,
      title: 'Progress Analytics',
      description: 'Visualize your learning journey with detailed analytics, identifying strengths and areas for improvement.'
    },
    {
      icon: <SparklesIcon />,
      title: 'Personalized Learning',
      description: 'Experience adaptive content that evolves with you, ensuring every session is optimized for maximum growth.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Your Account',
      description: 'Sign up in seconds and set your learning goals. Tell us what skills you want to master.'
    },
    {
      number: '2',
      title: 'Learn & Practice',
      description: 'Engage with AI-powered lessons, tackle challenges, and get instant feedback on your progress.'
    },
    {
      number: '3',
      title: 'Grow Together',
      description: 'Collaborate with peers, share your work, and climb the leaderboard as you master new skills.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navigation */}
      <nav className={'landing-nav ' + (scrolled ? 'scrolled' : '')}>
        <div className="nav-content">
          <div className="nav-logo">SkillWise</div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Learning Platform
          </div>
          
          <h1 className="hero-title">
            Learn Smarter, Not Harder with{' '}
            <span className="hero-title-gradient">SkillWise</span>
          </h1>
          
          <p className="hero-description">
            Transform your learning experience with personalized AI tutoring, 
            interactive challenges, and a supportive community. Master new skills 
            faster than ever before.
          </p>
          
          <div className="hero-cta">
            <Link to="/signup" className="cta-button primary">
              Start Learning Free
              <span className="cta-arrow"><ArrowRightIcon /></span>
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-label">Features</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-description">
              Powerful tools designed to accelerate your learning journey and help you achieve your goals.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={'feature-card animate-on-scroll delay-' + (index + 1)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Get Started in Minutes</h2>
            <p className="section-description">
              Three simple steps to transform your learning experience.
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className={'step-item animate-on-scroll delay-' + (index + 1)}>
                  <div className="step-number">{step.number}</div>
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card animate-on-scroll">
          <div className="cta-card-content">
            <h2 className="cta-title">Ready to Transform Your Learning?</h2>
            <p className="cta-description">
              Join thousands of learners who are already mastering new skills with SkillWise.
            </p>
            <Link to="/signup" className="cta-button-light">
              Get Started Free
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">SkillWise</div>
          <p className="footer-text">© 2025 SkillWise. Empowering learners everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
