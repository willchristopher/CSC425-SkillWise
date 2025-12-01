import React from 'react';
import AITutor from '../components/common/AITutor';
import PageLayout from '../components/layout/PageLayout';

const AITutorPage = () => {
  return (
    <PageLayout
      title="AI Coding Assistant"
      description="Get instant feedback, hints, and guidance powered by Google Gemini AI."
    >
      <AITutor
        challengeId="ai-tutor"
        challengeTitle="Code Review & Learning"
        challengeDescription="Submit your code to get personalized feedback and suggestions"
      />

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          How to Use the AI Tutor
        </h2>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get Feedback</h3>
              <p className="text-gray-600">
                Paste your code and get detailed, constructive feedback on your
                implementation, including strengths and areas for improvement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get Hints</h3>
              <p className="text-gray-600">
                Stuck on a problem? Get helpful hints and guidance without
                spoiling the solution. Perfect for learning!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Learn & Improve</h3>
              <p className="text-gray-600">
                Use the AI's suggestions to understand best practices, improve
                your coding style, and learn new concepts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-emerald-800">
            <strong>Powered by Google Gemini:</strong> This AI assistant uses
            advanced language models to provide personalized learning support.
            All feedback is generated in real-time!
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default AITutorPage;
