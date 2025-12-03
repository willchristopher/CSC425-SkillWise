import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import '../styles/pages.css';

// Profile Icon Components - Cool SVG icons for profile pictures
const ProfileIcons = {
  astronaut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/>
      <circle cx="12" cy="8" r="2"/>
      <path d="M9 4.5c0-1 .5-2 2-2.5"/>
      <path d="M15 4.5c0-1-.5-2-2-2.5"/>
    </svg>
  ),
  ninja: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="7"/>
      <path d="M5 10h14"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
      <path d="M12 17v4"/>
      <path d="M8 21h8"/>
    </svg>
  ),
  robot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="7" width="14" height="12" rx="2"/>
      <path d="M12 2v5"/>
      <circle cx="12" cy="2" r="1"/>
      <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
      <path d="M9 16h6"/>
      <path d="M3 12h2"/>
      <path d="M19 12h2"/>
    </svg>
  ),
  wizard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h-4l2-7z"/>
      <circle cx="12" cy="13" r="5"/>
      <circle cx="10" cy="12" r="1" fill="currentColor"/>
      <circle cx="14" cy="12" r="1" fill="currentColor"/>
      <path d="M10 15c.5.5 1.5 1 2 1s1.5-.5 2-1"/>
      <path d="M6 21c1-2 3-3 6-3s5 1 6 3"/>
    </svg>
  ),
  phoenix: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-2 2-4 5-4 8 0 3 2 5 4 5s4-2 4-5c0-3-2-6-4-8z"/>
      <path d="M8 12c-2-1-4 0-5 2"/>
      <path d="M16 12c2-1 4 0 5 2"/>
      <path d="M12 16v5"/>
      <path d="M10 19l2 2 2-2"/>
    </svg>
  ),
  wolf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l4-4 4 3 4-3 4 4v6c0 4-4 7-8 7s-8-3-8-7V8z"/>
      <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
      <path d="M12 13v2"/>
      <path d="M10 17c.5.5 1.2.8 2 .8s1.5-.3 2-.8"/>
    </svg>
  ),
  dragon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l3-3c1 0 2 1 3 1s2-1 3-1l3 3"/>
      <path d="M4 12c0 5 4 9 8 9s8-4 8-9c0-3-2-6-4-6h-8c-2 0-4 3-4 6z"/>
      <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
      <path d="M10 16l2 1 2-1"/>
    </svg>
  ),
  owl: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"/>
      <circle cx="9" cy="10" r="2"/>
      <circle cx="15" cy="10" r="2"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M12 14l-1 2h2l-1-2z" fill="currentColor"/>
      <path d="M6 6l2 2"/>
      <path d="M18 6l-2 2"/>
    </svg>
  ),
  fox: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l4-5 4 4 4-4 4 5v5c0 5-4 8-8 8s-8-3-8-8V8z"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M12 12v2"/>
      <path d="M10 16c1 1 3 1 4 0"/>
    </svg>
  ),
  bear: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="12" cy="13" r="7"/>
      <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
      <ellipse cx="12" cy="15" rx="2" ry="1.5"/>
    </svg>
  ),
  cat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 3v3c0 4 2 7 4 7s4-3 4-7v-3l4-3v-2l-4 2h-8l-4-2v2z"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M10 14l2 1 2-1"/>
      <path d="M8 15c-2 0-3 1-4 2"/>
      <path d="M16 15c2 0 3 1 4 2"/>
    </svg>
  ),
  alien: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="8" ry="10"/>
      <ellipse cx="9" cy="10" rx="2" ry="3"/>
      <ellipse cx="15" cy="10" rx="2" ry="3"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M10 16c1 1 3 1 4 0"/>
    </svg>
  ),
  crown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l4 12h12l4-12-5 4-5-6-5 6-5-4z"/>
      <circle cx="12" cy="4" r="1" fill="currentColor"/>
      <circle cx="4" cy="7" r="1" fill="currentColor"/>
      <circle cx="20" cy="7" r="1" fill="currentColor"/>
    </svg>
  ),
  lightning: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  diamond: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l7-5 7 5-7 13-7-13z"/>
      <path d="M5 8h14"/>
      <path d="M8 8l4 13 4-13"/>
    </svg>
  ),
};

// Available icons list
const PROFILE_ICON_OPTIONS = [
  { id: 'astronaut', name: 'Astronaut', color: '#6366f1' },
  { id: 'ninja', name: 'Ninja', color: '#1f2937' },
  { id: 'robot', name: 'Robot', color: '#0ea5e9' },
  { id: 'wizard', name: 'Wizard', color: '#8b5cf6' },
  { id: 'phoenix', name: 'Phoenix', color: '#f97316' },
  { id: 'wolf', name: 'Wolf', color: '#64748b' },
  { id: 'dragon', name: 'Dragon', color: '#10b981' },
  { id: 'owl', name: 'Owl', color: '#6b7280' },
  { id: 'fox', name: 'Fox', color: '#f59e0b' },
  { id: 'bear', name: 'Bear', color: '#78350f' },
  { id: 'cat', name: 'Cat', color: '#ec4899' },
  { id: 'alien', name: 'Alien', color: '#22c55e' },
  { id: 'crown', name: 'Crown', color: '#eab308' },
  { id: 'lightning', name: 'Lightning', color: '#3b82f6' },
  { id: 'shield', name: 'Shield', color: '#14b8a6' },
  { id: 'diamond', name: 'Diamond', color: '#a855f7' },
];

// Export for use in other components
export { ProfileIcons, PROFILE_ICON_OPTIONS };

// SVG Icons for UI
const TrophyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const TargetIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FlameIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const FileIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const RocketIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const AwardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, updateProfile } = useAuth();

  // Get the icon component for a given icon ID
  const getProfileIcon = (iconId) => {
    const IconComponent = ProfileIcons[iconId];
    return IconComponent ? <IconComponent /> : null;
  };

  // Get icon color for a given icon ID
  const getIconColor = (iconId) => {
    const option = PROFILE_ICON_OPTIONS.find(opt => opt.id === iconId);
    return option?.color || '#6366f1';
  };

  // Fetch real profile data from API
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch profile, achievements, activity, and skills in parallel
      const [profileRes, achievementsRes, activityRes, skillsRes] =
        await Promise.all([
          apiService.user.getProfile(),
          apiService.leaderboard
            .getAchievements()
            .catch(() => ({ data: { success: false } })),
          apiService.progress
            .getActivity()
            .catch(() => ({ data: { success: false } })),
          apiService.progress
            .getSkills()
            .catch(() => ({ data: { success: false } })),
        ]);

      console.log('Profile API response:', profileRes?.data);

      const profile = profileRes?.data?.data;
      const achievements = achievementsRes?.data?.data?.achievements || [];
      const activity =
        activityRes?.data?.data?.activities || activityRes?.data?.data || [];
      const skills =
        skillsRes?.data?.data?.skills || skillsRes?.data?.data || [];

      console.log('Parsed profile:', profile);

      if (!profile) {
        throw new Error('Failed to load profile');
      }

      // Format profile data
      const formattedProfile = {
        id: profile.id,
        firstName: profile.firstName || user?.firstName || '',
        lastName: profile.lastName || user?.lastName || '',
        email: profile.email || user?.email || '',
        profileIcon: profile.profileIcon || 'astronaut',
        bio: profile.bio || '',
        joinedDate: profile.createdAt || new Date().toISOString(),
        totalPoints: profile.stats?.totalPoints || 0,
        completedChallenges: profile.stats?.challengesCompleted || 0,
        goalsAchieved: profile.stats?.goalsCompleted || 0,
        currentStreak: profile.stats?.currentStreak || 0,
        longestStreak: profile.stats?.longestStreak || 0,
        peerReviewsGiven: profile.stats?.peerReviewsGiven || 0,
        peerReviewsReceived: profile.stats?.peerReviewsReceived || 0,
        experiencePoints: profile.stats?.experiencePoints || 0,
        rank: profile.stats?.rank || null,
        badges:
          achievements.length > 0
            ? achievements.map((a) => ({
                id: a.id,
                name: a.name,
                icon: a.icon || 'star',
                description: a.description,
                earned: a.earned_at !== null,
              }))
            : [
                {
                  id: 1,
                  name: 'First Steps',
                  icon: 'rocket',
                  description: 'Complete your first challenge',
                  earned: false,
                },
                {
                  id: 2,
                  name: 'Streak Master',
                  icon: 'flame',
                  description: '7-day learning streak',
                  earned: false,
                },
                {
                  id: 3,
                  name: 'Goal Crusher',
                  icon: 'target',
                  description: 'Complete 5 learning goals',
                  earned: false,
                },
                {
                  id: 4,
                  name: 'Peer Mentor',
                  icon: 'users',
                  description: 'Provide 10 peer reviews',
                  earned: false,
                },
                {
                  id: 5,
                  name: 'Challenge Master',
                  icon: 'star',
                  description: 'Complete 50 challenges',
                  earned: false,
                },
              ],
        skills:
          skills.length > 0
            ? skills.map((s) => ({
                name: s.name || s.skill_name,
                level: s.level || s.proficiency || 0,
                category: s.category || 'General',
              }))
            : [],
        recentActivity: Array.isArray(activity)
          ? activity.slice(0, 10).map((a) => ({
              id: a.id,
              type: a.event_type || a.type || 'activity',
              title: a.description || a.title || 'Activity',
              date: a.created_at || a.date,
              points: a.points_earned || a.points || 0,
            }))
          : [],
        preferences: {
          emailNotifications: true,
          pushNotifications: false,
          weeklyDigest: true,
          publicProfile: true,
          showProgress: true,
        },
      };

      setProfileData(formattedProfile);
      setFormData(formattedProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');

      // Set minimal profile from auth context if API fails
      if (user) {
        const fallbackProfile = {
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          profileIcon: 'astronaut',
          bio: '',
          joinedDate: new Date().toISOString(),
          totalPoints: 0,
          completedChallenges: 0,
          goalsAchieved: 0,
          currentStreak: 0,
          longestStreak: 0,
          peerReviewsGiven: 0,
          peerReviewsReceived: 0,
          experiencePoints: 0,
          rank: null,
          badges: [],
          skills: [],
          recentActivity: [],
          preferences: {
            emailNotifications: true,
            pushNotifications: false,
            weeklyDigest: true,
            publicProfile: true,
            showProgress: true,
          },
        };
        setProfileData(fallbackProfile);
        setFormData(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIconSelect = (iconId) => {
    setFormData((prev) => ({
      ...prev,
      profileIcon: iconId,
    }));
    setShowIconPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await apiService.user.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profileIcon: formData.profileIcon,
      });

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          profileIcon: formData.profileIcon,
        }));
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Update auth context if available
        if (updateProfile) {
          await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            bio: formData.bio,
            profileIcon: formData.profileIcon,
          });
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'challenge':
        return <TrophyIcon />;
      case 'goal':
        return <TargetIcon />;
      case 'review':
        return <UsersIcon />;
      case 'streak':
        return <FlameIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'rocket':
        return <RocketIcon />;
      case 'flame':
        return <FlameIcon />;
      case 'target':
        return <TargetIcon />;
      case 'users':
        return <UsersIcon />;
      case 'star':
        return <StarIcon />;
      default:
        return <AwardIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading && !profileData) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <AppLayout title="Profile" subtitle="Manage your account and preferences">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="profile-success-message">
          <CheckIcon /> {successMessage}
        </div>
      )}
      {error && (
        <div className="profile-error-message">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-page-header">
        <div className="profile-page-info">
          <div 
            className="profile-page-avatar profile-icon-display"
            style={{ 
              '--icon-color': getIconColor(profileData?.profileIcon || 'astronaut'),
              backgroundColor: `${getIconColor(profileData?.profileIcon || 'astronaut')}15`
            }}
          >
            {getProfileIcon(profileData?.profileIcon || 'astronaut')}
          </div>

          <div className="profile-page-details">
            <h1 className="profile-page-name">
              {profileData?.firstName} {profileData?.lastName}
            </h1>
            <p className="profile-page-bio">
              {profileData?.bio || 'No bio yet. Click Edit Profile to add one!'}
            </p>
            <div className="profile-page-meta">
              <span className="profile-meta-item">
                <CalendarIcon /> Joined {formatDate(profileData?.joinedDate)}
              </span>
            </div>
          </div>

          <div className="profile-page-stats">
            <div className="profile-stat-item">
              <strong className="stat-value">
                {profileData?.totalPoints.toLocaleString()}
              </strong>
              <span className="stat-label">Total Points</span>
            </div>
            <div className="profile-stat-item">
              <strong className="stat-value">
                {profileData?.completedChallenges}
              </strong>
              <span className="stat-label">Challenges</span>
            </div>
            <div className="profile-stat-item">
              <strong className="stat-value">
                {profileData?.currentStreak}
              </strong>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button
          className={`profile-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="profile-card">
          <div className="form-section">
            <h3 className="profile-section-title">Profile Icon</h3>
            <div className="profile-icon-selector">
              <div 
                className="current-icon-preview"
                style={{ 
                  '--icon-color': getIconColor(formData.profileIcon || 'astronaut'),
                  backgroundColor: `${getIconColor(formData.profileIcon || 'astronaut')}15`
                }}
                onClick={() => setShowIconPicker(!showIconPicker)}
              >
                {getProfileIcon(formData.profileIcon || 'astronaut')}
                <span className="change-icon-label">Click to change</span>
              </div>
              
              {showIconPicker && (
                <div className="icon-picker-grid">
                  {PROFILE_ICON_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`icon-picker-item ${formData.profileIcon === option.id ? 'selected' : ''}`}
                      style={{ 
                        '--icon-color': option.color,
                        backgroundColor: `${option.color}15`
                      }}
                      onClick={() => handleIconSelect(option.id)}
                      title={option.name}
                    >
                      {getProfileIcon(option.id)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="profile-section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                className="form-textarea"
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setShowIconPicker(false);
                setFormData(profileData);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && !isEditing && (
        <div className="profile-overview-grid">
          <div className="profile-card">
            <h3 className="profile-section-title">Recent Activity</h3>
            <div>
              {profileData?.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <div className="activity-meta">
                      <span>{formatTimeAgo(activity.date)}</span>
                      <span className="points-earned">
                        +{activity.points} points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-section-title">Achievements</h3>
            <div className="profile-achievement-stats">
              <div>
                <div className="stat-value">{profileData?.goalsAchieved}</div>
                <div className="stat-label">Goals Achieved</div>
              </div>
              <div>
                <div className="stat-value">{profileData?.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
              <div>
                <div className="stat-value">
                  {profileData?.badges.filter((b) => b.earned).length}
                </div>
                <div className="stat-label">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && !isEditing && (
        <div className="profile-card">
          <h3 className="section-title">Skill Progress</h3>
          <div>
            {profileData?.skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-level">
                    {skill.category} - {skill.level}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && !isEditing && (
        <div className="profile-card">
          <h3 className="section-title">Badge Collection</h3>
          <div className="badge-grid">
            {profileData?.badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-item ${badge.earned ? '' : 'badge-locked'}`}
              >
                <div className="badge-icon">{getBadgeIcon(badge.icon)}</div>
                <h4 className="badge-name">{badge.name}</h4>
                <p className="badge-description">{badge.description}</p>
                {badge.earned ? (
                  <span className="badge-status badge-earned">
                    <CheckIcon /> Earned
                  </span>
                ) : (
                  <span className="badge-status badge-pending">
                    <LockIcon /> Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && !isEditing && (
        <div>
          <div className="profile-card">
            <h3 className="section-title">Notification Preferences</h3>
            <div>
              <label className="settings-item">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  name="emailNotifications"
                  checked={formData.preferences?.emailNotifications || false}
                  onChange={handleInputChange}
                />
                <span>Email notifications</span>
              </label>

              <label className="settings-item">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  name="pushNotifications"
                  checked={formData.preferences?.pushNotifications || false}
                  onChange={handleInputChange}
                />
                <span>Push notifications</span>
              </label>

              <label className="settings-item">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  name="weeklyDigest"
                  checked={formData.preferences?.weeklyDigest || false}
                  onChange={handleInputChange}
                />
                <span>Weekly progress digest</span>
              </label>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="section-title">Privacy Settings</h3>
            <div>
              <label className="settings-item">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  name="publicProfile"
                  checked={formData.preferences?.publicProfile || false}
                  onChange={handleInputChange}
                />
                <span>Public profile</span>
              </label>

              <label className="settings-item">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  name="showProgress"
                  checked={formData.preferences?.showProgress || false}
                  onChange={handleInputChange}
                />
                <span>Show progress on leaderboard</span>
              </label>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </AppLayout>
  );
};

export default ProfilePage;
