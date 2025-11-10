import React from 'react';
import ProgressDashboard from '../components/progress/ProgressDashboard';

const ProgressPage = () => {
  return (
    <div className="progress-page min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ProgressDashboard />
      </div>
    </div>
  );
};

export default ProgressPage;