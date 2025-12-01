import React, { useState } from 'react';

export default function OrderingQuestion({
  question,
  onAnswer,
  showResult,
  disabled,
}) {
  const [items, setItems] = useState(
    question.items.map((item, index) => ({ id: index, text: item }))
  );
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    if (disabled || showResult) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (
      disabled ||
      showResult ||
      draggedIndex === null ||
      draggedIndex === index
    )
      return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onAnswer?.(items.map((item) => item.id));
  };

  const moveItem = (fromIndex, direction) => {
    if (disabled || showResult) return;
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    [newItems[fromIndex], newItems[toIndex]] = [
      newItems[toIndex],
      newItems[fromIndex],
    ];
    setItems(newItems);
    onAnswer?.(newItems.map((item) => item.id));
  };

  const isCorrect =
    showResult &&
    JSON.stringify(items.map((i) => i.id)) ===
      JSON.stringify(question.correctOrder);

  const getCorrectPosition = (itemId) => {
    return question.correctOrder.indexOf(itemId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
          🔢 Put in Order
        </span>
      </div>

      <p className="text-gray-600 mb-4">{question.instructions}</p>

      <div className="space-y-2">
        {items.map((item, index) => {
          const isInCorrectPosition =
            showResult && question.correctOrder[index] === item.id;

          return (
            <div
              key={item.id}
              draggable={!disabled && !showResult}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                ${
                  showResult
                    ? isInCorrectPosition
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                    : 'bg-gray-50 border-gray-200 hover:border-amber-300 cursor-grab active:cursor-grabbing'
                }`}
            >
              {/* Position Number */}
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${
                  showResult
                    ? isInCorrectPosition
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {index + 1}
              </span>

              {/* Drag Handle */}
              <span className="text-gray-400 flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
              </span>

              {/* Item Text */}
              <span
                className={`flex-1 ${
                  showResult && !isInCorrectPosition
                    ? 'text-red-700'
                    : 'text-gray-700'
                }`}
              >
                {item.text}
              </span>

              {/* Move Buttons (for touch/keyboard users) */}
              {!showResult && !disabled && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Result indicator */}
              {showResult && (
                <span
                  className={`flex-shrink-0 ${
                    isInCorrectPosition ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isInCorrectPosition ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">
                      → {getCorrectPosition(item.id) + 1}
                    </span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isCorrect
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p
            className={`text-sm ${
              isCorrect ? 'text-green-700' : 'text-amber-700'
            }`}
          >
            {isCorrect
              ? '✅ Perfect order!'
              : `📝 Correct order: ${question.correctOrder
                  .map((i) => question.items[i])
                  .join(' → ')}`}
          </p>
          {question.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
