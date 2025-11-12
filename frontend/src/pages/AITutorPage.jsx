import React from 'react';
import AITutor from '../components/common/AITutor';

const AITutorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Coding Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Get instant feedback, hints, and guidance powered by Google Gemini AI
          </p>
        </div>

        <AITutor 
          challengeId="ai-tutor"
          challengeTitle="Code Review & Learning"
          challengeDescription="Submit your code to get personalized feedback and suggestions"
        />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            How to Use the AI Tutor
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-semibold">Get Feedback</h3>
                <p>Paste your code and get detailed, constructive feedback on your implementation, including strengths and areas for improvement.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💡</span>
              <div>
                <h3 className="font-semibold">Get Hints</h3>
                <p>Stuck on a problem? Get helpful hints and guidance without spoiling the solution. Perfect for learning!</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <h3 className="font-semibold">Learn & Improve</h3>
                <p>Use the AI's suggestions to understand best practices, improve your coding style, and learn new concepts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💎 Powered by Google Gemini:</strong> This AI assistant uses advanced language models to provide personalized learning support. All feedback is generated in real-time!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
