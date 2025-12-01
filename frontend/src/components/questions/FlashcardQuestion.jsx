import React, { useState } from 'react';

export default function FlashcardQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidence, setConfidence] = useState(null);

  const handleFlip = () => {
    if (!disabled) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleConfidence = (level) => {
    if (disabled) return;
    setConfidence(level);
    onAnswer?.({ flipped: isFlipped, confidence: level });
  };

  const confidenceLevels = [
    { value: 1, label: "Didn't Know", color: 'red', icon: '😕' },
    { value: 2, label: 'Hard', color: 'orange', icon: '🤔' },
    { value: 3, label: 'Good', color: 'yellow', icon: '😊' },
    { value: 4, label: 'Easy', color: 'green', icon: '😄' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
          🃏 Flashcard
        </span>
        {question.category && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {question.category}
          </span>
        )}
      </div>

      {/* Flashcard Container */}
      <div
        className="perspective-1000 cursor-pointer mb-6"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-64 transition-transform duration-500 transform-style-3d
            ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 
              flex items-center justify-center p-6 shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="text-xs text-cyan-100 mb-4 uppercase tracking-wide">
                Question
              </p>
              <p className="text-xl font-semibold text-white leading-relaxed">
                {question.front}
              </p>
              <p className="text-cyan-200 text-sm mt-6">
                Click to reveal answer →
              </p>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 
              flex items-center justify-center p-6 shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-4 uppercase tracking-wide">
                Answer
              </p>
              <p className="text-xl font-semibold text-white leading-relaxed">
                {question.back}
              </p>
              <p className="text-emerald-200 text-sm mt-6">
                ← Click to see question
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Rating */}
      {isFlipped && !showResult && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3 text-center">
            How well did you know this?
          </p>
          <div className="flex justify-center gap-2">
            {confidenceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => handleConfidence(level.value)}
                disabled={disabled}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    confidence === level.value
                      ? level.color === 'red'
                        ? 'bg-red-500 text-white'
                        : level.color === 'orange'
                        ? 'bg-orange-500 text-white'
                        : level.color === 'yellow'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <span className="mr-1">{level.icon}</span>
                {level.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResult && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <p className="text-emerald-700">
            {confidence === 4
              ? '🌟 Great job! This one is easy for you.'
              : confidence === 3
              ? '👍 Good progress! Keep practicing.'
              : confidence === 2
              ? '💪 Keep working on this one!'
              : confidence === 1
              ? '📚 This needs more review.'
              : 'Card reviewed!'}
          </p>
        </div>
      )}
    </div>
  );
}
