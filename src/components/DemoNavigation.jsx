import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DemoNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/ai-tutor', label: 'AI Tutor' },
    { path: '/challenges', label: 'Challenges' },
    { path: '/goals', label: 'Goals' },
    { path: '/progress', label: 'Progress' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/peer-review', label: 'Peer Review' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #facc15, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SkillWise</h1>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{ 
                  paddingLeft: '1rem', 
                  paddingRight: '1rem', 
                  paddingTop: '0.5rem', 
                  paddingBottom: '0.5rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  transition: 'all 0.2s',
                  backgroundColor: location.pathname === item.path ? 'white' : 'transparent',
                  color: location.pathname === item.path ? '#2563eb' : 'white',
                  boxShadow: location.pathname === item.path ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DemoNavigation;
