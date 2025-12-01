import React from 'react';
import MCQQuestion from './MCQQuestion';
import FillBlankQuestion from './FillBlankQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import MatchingQuestion from './MatchingQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import LongResponseQuestion from './LongResponseQuestion';
import CodeChallengeQuestion from './CodeChallengeQuestion';
import PracticalQuestion from './PracticalQuestion';
import FlashcardQuestion from './FlashcardQuestion';
import OrderingQuestion from './OrderingQuestion';

const QUESTION_COMPONENTS = {
  mcq: MCQQuestion,
  'fill-blank': FillBlankQuestion,
  'true-false': TrueFalseQuestion,
  matching: MatchingQuestion,
  'short-answer': ShortAnswerQuestion,
  'long-response': LongResponseQuestion,
  'code-challenge': CodeChallengeQuestion,
  practical: PracticalQuestion,
  flashcard: FlashcardQuestion,
  ordering: OrderingQuestion,
};

/**
 * Smart wrapper that renders the appropriate question component based on type
 */
export default function QuestionRenderer({
  question,
  index,
  onAnswer,
  showResult,
  disabled,
  className = '',
}) {
  const QuestionComponent = QUESTION_COMPONENTS[question.type];

  if (!QuestionComponent) {
    return (
      <div
        className={`bg-amber-50 border border-amber-200 rounded-xl p-6 ${className}`}
      >
        <p className="text-amber-700">
          <strong>Unknown question type:</strong> {question.type}
        </p>
        <pre className="mt-2 text-xs text-gray-600 overflow-auto">
          {JSON.stringify(question, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className={className}>
      {index !== undefined && (
        <div className="mb-2 text-sm font-medium text-gray-500">
          Question {index + 1}
        </div>
      )}
      <QuestionComponent
        question={question}
        onAnswer={onAnswer}
        showResult={showResult}
        disabled={disabled}
      />
    </div>
  );
}

// Export the type map for reference
export { QUESTION_COMPONENTS };
