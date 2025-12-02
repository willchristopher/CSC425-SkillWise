import React from 'react';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import AppLayout from '../components/layout/AppLayout';

const ProgressPage = () => {
  return (
    <AppLayout title="Progress" subtitle="Track your learning journey">
      <ProgressDashboard />
    </AppLayout>
  );
};

export default ProgressPage;
