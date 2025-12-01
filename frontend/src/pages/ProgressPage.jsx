import React from 'react';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import PageLayout from '../components/layout/PageLayout';

const ProgressPage = () => {
  return (
    <PageLayout
      title="Progress Analytics"
      description="Track your learning journey with detailed insights and metrics."
    >
      <ProgressDashboard />
    </PageLayout>
  );
};

export default ProgressPage;
