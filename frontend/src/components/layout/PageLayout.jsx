import React from 'react';
import Navbar from './Navbar';

const PageLayout = ({ children, title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            )}
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
