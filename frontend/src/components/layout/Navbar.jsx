import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', protected: true },
    { path: '/goals', label: 'Goals', protected: true },
    { path: '/challenges', label: 'Challenges', protected: true },
    { path: '/progress', label: 'Progress', protected: true },
    { path: '/leaderboard', label: 'Leaderboard', protected: true },
    { path: '/peer-review', label: 'Peer Review', protected: true },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          SkillWise
        </Link>
      </div>

      <div className="navbar-menu">
        {/* Show navigation links based on auth state */}
        {user ? (
          <>
            <ul className="navbar-links">
              {navLinks.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="navbar-auth">
              <Link to="/profile" className="nav-link profile">
                {user.first_name} {user.last_name}
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-login">
              Login
            </Link>
            <Link to="/signup" className="btn btn-signup">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;