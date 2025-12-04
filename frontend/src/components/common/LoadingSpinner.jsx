import React, { useState, useEffect } from 'react';
import './LoadingSpinner.css';

// Fun facts to display while loading (each ~7 words or less)
const funFacts = [
  'Octopuses have three hearts and blue blood.',
  'Honey never spoils, even after millennia.',
  "Bananas are berries, but strawberries aren't.",
  'A day on Venus is longer than its year.',
  'Sloths can hold their breath for 40 minutes.',
  'Wombat poop is cube-shaped. Really!',
  'Sharks existed before trees on Earth.',
  'Hot water freezes faster than cold water.',
  "A group of flamingos is called a 'flamboyance'.",
  'Cows have best friends and get stressed apart.',
  'The inventor of Pringles is buried in one.',
  "Scotland's national animal is the unicorn.",
  'Honey bees can recognize human faces.',
  'A jiffy is an actual unit of time.',
  'Astronauts grow taller in space.',
  "Cats can't taste sweet things.",
  "Apples float because they're 25% air.",
  'Dolphins sleep with one eye open.',
  'An octopus has nine brains total.',
  'Koalas have unique fingerprints like humans.',
];

const LoadingSpinner = ({
  size = 'medium',
  message = 'Loading...',
  showFact = null, // null means auto-detect based on size
  fullPage = false,
}) => {
  const [currentFact, setCurrentFact] = useState('');
  const [factIndex, setFactIndex] = useState(0);

  // Auto-determine if we should show facts (don't show for small spinners)
  const shouldShowFact = showFact !== null ? showFact : size !== 'small';

  useEffect(() => {
    if (!shouldShowFact) return;

    // Pick a random starting fact
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setFactIndex(randomIndex);
    setCurrentFact(funFacts[randomIndex]);

    // Rotate facts every 4 seconds
    const interval = setInterval(() => {
      setFactIndex((prev) => {
        const newIndex = (prev + 1) % funFacts.length;
        setCurrentFact(funFacts[newIndex]);
        return newIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [shouldShowFact]);

  const sizeClass =
    {
      small: 'spinner-small',
      medium: 'spinner-medium',
      large: 'spinner-large',
    }[size] || 'spinner-medium';

  // For small spinners (inline use), use minimal container
  if (size === 'small') {
    return (
      <div
        className={`spinner-wrapper ${sizeClass}`}
        style={{ display: 'inline-flex' }}
      >
        <div className="spinner-ring spinner-ring-outer"></div>
        <div className="spinner-ring spinner-ring-inner"></div>
        <div className="spinner-center"></div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className={`spinner-wrapper ${sizeClass}`}>
        {/* Outer ring */}
        <div className="spinner-ring spinner-ring-outer"></div>
        {/* Inner ring (spins opposite direction) */}
        <div className="spinner-ring spinner-ring-inner"></div>
        {/* Center pulse */}
        <div className="spinner-center"></div>
      </div>

      {message && size !== 'small' && (
        <p className="loading-message">{message}</p>
      )}

      {shouldShowFact && currentFact && (
        <div className="fun-fact-container">
          <span className="fun-fact-icon">💡</span>
          <p className="fun-fact-text">{currentFact}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
