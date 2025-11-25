import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIChallengeModal from '../components/challenges/AIChallengeModal';
import { apiService } from '../services/api';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [isAIChallengeOpen, setIsAIChallengeOpen] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: 'Build a React Component',
        description: 'Create a reusable React component with props and state management.',
        category: 'Programming',
        difficulty: 'Medium',
        points: 50,
        estimatedTime: 45,
        tags: ['React', 'JavaScript', 'Frontend']
      },
      {
        id: 2,
        title: 'Design a Logo',
        description: 'Design a professional logo using design principles and color theory.',
        category: 'Design',
        difficulty: 'Easy',
        points: 30,
        estimatedTime: 60,
        tags: ['Design', 'Branding', 'Creative']
      },
      {
        id: 3,
        title: 'Database Optimization',
        description: 'Optimize a slow database query and improve performance metrics.',
        category: 'Backend',
        difficulty: 'Hard',
        points: 100,
        estimatedTime: 120,
        tags: ['SQL', 'Database', 'Performance']
      }
    ];

    setTimeout(() => {
      setChallenges(mockChallenges);
      setFilteredChallenges(mockChallenges);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter challenges based on current filters
  useEffect(() => {
    let filtered = challenges;

    if (filters.category) {
      filtered = filtered.filter(challenge => 
        challenge.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(challenge => 
        challenge.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    if (filters.search) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        challenge.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dcfce7 0%, #dbeafe 50%, #f3e8ff 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 2.25rem)',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>🚀 Learning Challenges</h1>
              <p style={{
                fontSize: '1.125rem',
                color: '#4b5563',
                lineHeight: 1.6
              }}>Enhance your skills with hands-on learning experiences</p>
            </div>
            <button 
              onClick={async () => {
                setIsAIChallengeOpen(true);
                setGeneratedChallenge(null);
                try {
                  const res = await apiService.ai.generateChallenge({ topic: 'algorithms', difficulty: 'medium' });
                  const challenge = res.data?.data?.challenge || res.data?.challenge || res.data;
                  setGeneratedChallenge(challenge);
                } catch (err) {
                  console.error('AI generate error', err);
                  setGeneratedChallenge({ title: 'Error', description: 'Failed to generate challenge' });
                }
              }}
              className="mt-4 md:mt-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center">
                🤖 Generate AI Challenge
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Challenges</label>
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Backend">Backend</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner message="Loading challenges..." />
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No challenges found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <AIChallengeModal
        isOpen={isAIChallengeOpen}
        onClose={() => { setIsAIChallengeOpen(false); setGeneratedChallenge(null); }}
        challenge={generatedChallenge}
      />
    </div>
  );
};

export default ChallengesPage;