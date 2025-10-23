import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-blue-600">SkillWise</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your Studies with
              <span className="text-blue-600 block mt-2">AI-Powered Tutoring</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your learning experience with personalized AI tutoring, interactive challenges, 
              and peer collaboration. Excel in your courses with SkillWise's intelligent learning platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>

            {/* Feature Preview Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {/* AI Tutoring Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Tutoring</h3>
                <p className="text-gray-600">
                  Get personalized explanations and instant feedback from our advanced AI tutor, 
                  available 24/7 to help you understand complex concepts.
                </p>
              </div>

              {/* Interactive Challenges Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Challenges</h3>
                <p className="text-gray-600">
                  Master your subjects through engaging coding challenges, quizzes, and 
                  hands-on exercises designed for your learning level.
                </p>
              </div>

              {/* Peer Learning Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Peer Collaboration</h3>
                <p className="text-gray-600">
                  Connect with classmates, participate in study groups, and learn together 
                  through peer reviews and collaborative projects.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 bg-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-8">Join Thousands of Successful Students</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-blue-200">Students Helped</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">95%</div>
                  <div className="text-blue-200">Improved Grades</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-blue-200">AI Support</div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join SkillWise today and experience the future of education
              </p>
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Start Learning Now →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">SkillWise</h3>
            <p className="text-gray-400 mb-4">Empowering students with AI-driven learning</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2025 SkillWise. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;