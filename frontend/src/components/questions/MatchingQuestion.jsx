import React, { useState } from 'react';

export default function MatchingQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [pairs, setPairs] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const handleLeftClick = (index) => {
    if (disabled || showResult) return;
    setSelectedLeft(index);
  };

  const handleRightClick = (rightIndex) => {
    if (disabled || showResult || selectedLeft === null) return;

    // Remove any existing pair with either item
    const newPairs = pairs.filter(
      ([l, r]) => l !== selectedLeft && r !== rightIndex
    );

    // Add the new pair
    newPairs.push([selectedLeft, rightIndex]);
    setPairs(newPairs);
    setSelectedLeft(null);
    onAnswer?.(newPairs);
  };

  const getPairForLeft = (leftIndex) => {
    const pair = pairs.find(([l]) => l === leftIndex);
    return pair ? pair[1] : null;
  };

  const getPairForRight = (rightIndex) => {
    const pair = pairs.find(([, r]) => r === rightIndex);
    return pair ? pair[0] : null;
  };

  const isPairCorrect = (leftIndex) => {
    if (!showResult) return null;
    const rightIndex = getPairForLeft(leftIndex);
    if (rightIndex === null) return false;
    return question.correctPairs.some(
      ([l, r]) => l === leftIndex && r === rightIndex
    );
  };

  const colors = [
    'emerald',
    'blue',
    'purple',
    'amber',
    'rose',
    'cyan',
    'orange',
    'indigo',
  ];

  const getPairColor = (index) => {
    const pairIndex = pairs.findIndex(([l]) => l === index);
    if (pairIndex === -1) return null;
    return colors[pairIndex % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
          Matching
        </span>
      </div>

      <p className="text-gray-600 mb-4">{question.instructions}</p>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Items
          </h4>
          {question.leftItems.map((item, index) => {
            const isSelected = selectedLeft === index;
            const pairedRight = getPairForLeft(index);
            const pairColor = getPairColor(index);
            const correct = isPairCorrect(index);

            let classes =
              'p-4 rounded-lg border-2 transition-all cursor-pointer';

            if (showResult) {
              if (correct === true) {
                classes += ' bg-green-50 border-green-500 text-green-800';
              } else if (correct === false) {
                classes += ' bg-red-50 border-red-500 text-red-800';
              }
            } else if (isSelected) {
              classes +=
                ' bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300';
            } else if (pairedRight !== null && pairColor) {
              classes += ` bg-${pairColor}-50 border-${pairColor}-400`;
            } else {
              classes += ' bg-gray-50 border-gray-200 hover:border-emerald-300';
            }

            return (
              <button
                key={index}
                onClick={() => handleLeftClick(index)}
                disabled={disabled || showResult}
                className={classes}
                style={
                  pairedRight !== null && !showResult
                    ? {
                        backgroundColor: `var(--${pairColor}-50, #f0fdf4)`,
                        borderColor: `var(--${pairColor}-400, #4ade80)`,
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                  {pairedRight !== null && (
                    <span className="ml-auto text-xs font-medium px-2 py-1 bg-white rounded-full shadow-sm">
                      → {String.fromCharCode(65 + pairedRight)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Matches
          </h4>
          {question.rightItems.map((item, index) => {
            const pairedLeft = getPairForRight(index);
            const hasPair = pairedLeft !== null;
            const pairColor = hasPair ? getPairColor(pairedLeft) : null;

            let classes = 'p-4 rounded-lg border-2 transition-all';

            if (showResult) {
              // Check if this right item is correctly matched
              const isCorrectMatch = question.correctPairs.some(([l, r]) => {
                const userPair = pairs.find(([ul]) => ul === l);
                return r === index && userPair && userPair[1] === r;
              });
              if (isCorrectMatch) {
                classes += ' bg-green-50 border-green-500';
              } else if (hasPair) {
                classes += ' bg-red-50 border-red-500';
              } else {
                classes += ' bg-gray-50 border-gray-200';
              }
            } else if (selectedLeft !== null) {
              classes += hasPair
                ? ' bg-gray-100 border-gray-300'
                : ' bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer';
            } else if (hasPair && pairColor) {
              classes += ` bg-${pairColor}-50 border-${pairColor}-400`;
            } else {
              classes += ' bg-gray-50 border-gray-200';
            }

            return (
              <button
                key={index}
                onClick={() => handleRightClick(index)}
                disabled={disabled || showResult || selectedLeft === null}
                className={classes}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{item}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!showResult && selectedLeft !== null && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <p className="text-sm text-emerald-700">
            Now click on a match for:{' '}
            <strong>{question.leftItems[selectedLeft]}</strong>
          </p>
        </div>
      )}

      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            pairs.length === question.correctPairs.length &&
            pairs.every(([l, r]) =>
              question.correctPairs.some(([cl, cr]) => cl === l && cr === r)
            )
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p className="text-sm font-medium mb-2">Correct Matches:</p>
          <ul className="text-sm space-y-1">
            {question.correctPairs.map(([l, r], i) => (
              <li key={i} className="text-gray-700">
                {question.leftItems[l]} → {question.rightItems[r]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
