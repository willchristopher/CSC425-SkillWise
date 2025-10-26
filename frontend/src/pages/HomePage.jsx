import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/HomePage.css';

const HomePage = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Add scroll animation for elements
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 100) {
          element.classList.add('animate-in');
        }
      });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check

    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero bg-gradient">
        <div className="hero-content container mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6 animate-on-scroll">
            Level Up Your Skills with <span className="text-primary">SkillWise</span>
          </h1>
          <p className="text-xl mb-8 animate-on-scroll">
            Your AI-powered learning companion for accelerated skill development and mastery
          </p>
          <div className="hero-actions space-x-4 animate-on-scroll">
            {!user ? (
              <>
                <Link to="/signup" className="btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-20 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-on-scroll">
            Why Choose SkillWise?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card p-6 bg-white rounded-lg shadow-lg animate-on-scroll"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-primary text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-on-scroll">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="step-card text-center animate-on-scroll"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="step-number mb-4">
                  <span className="bg-primary text-white rounded-full w-10 h-10 inline-flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 animate-on-scroll">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 animate-on-scroll">
            Join thousands of learners who are accelerating their skill development with SkillWise
          </p>
          <div className="animate-on-scroll">
            {!user ? (
              <Link to="/signup" className="btn-white">
                Get Started Free
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-white">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature data
const features = [
  {
    icon: "🤖",
    title: "AI-Powered Feedback",
    description: "Get instant, personalized feedback on your work using advanced AI technology to accelerate your learning."
  },
  {
    icon: "🎯",
    title: "Smart Goal Tracking",
    description: "Set meaningful learning goals and track your progress with intelligent metrics and insights."
  },
  {
    icon: "👥",
    title: "Peer Learning",
    description: "Connect with peers, share knowledge, and grow together through structured peer reviews and collaboration."
  },
  {
    icon: "📈",
    title: "Progress Analytics",
    description: "Visualize your learning journey with detailed analytics and progress tracking."
  },
  {
    icon: "🏆",
    title: "Skill Challenges",
    description: "Test your skills with real-world challenges and earn badges to showcase your expertise."
  },
  {
    icon: "🌟",
    title: "Personalized Path",
    description: "Follow a learning path tailored to your goals, skill level, and learning style."
  }
];

// How it works steps
const steps = [
  {
    title: "Set Your Goals",
    description: "Define your learning objectives and create a personalized development plan."
  },
  {
    title: "Complete Challenges",
    description: "Work on real-world challenges designed to build practical skills."
  },
  {
    title: "Get Feedback",
    description: "Receive AI-powered feedback and peer reviews to improve your work."
  },
  {
    title: "Track Progress",
    description: "Monitor your growth and celebrate achievements as you level up."
  }
];

export default HomePage;