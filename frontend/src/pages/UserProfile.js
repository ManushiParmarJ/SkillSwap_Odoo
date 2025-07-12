import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Star, 
  Calendar, 
  MessageSquare, 
  Briefcase,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapData, setSwapData] = useState({
    requestedSkillId: '',
    offeredSkillId: '',
    message: ''
  });
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchMySkills();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      const response = await axios.get(`/api/users/${userId}`);
      console.log('📦 User profile response:', response.data);
      setUser(response.data.user);
      setSkills(response.data.skills);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchMySkills = async () => {
    try {
      const response = await axios.get('/api/skills/my-skills');
      setMySkills(response.data.skills);
    } catch (error) {
      console.error('Error fetching my skills:', error);
    }
  };

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    
    if (!swapData.requestedSkillId || !swapData.offeredSkillId) {
      toast.error('Please select both skills for the swap');
      return;
    }

    setSwapLoading(true);
    
    try {
      const response = await axios.post('/api/swaps', {
        recipientId: userId,
        requestedSkillId: swapData.requestedSkillId,
        offeredSkillId: swapData.offeredSkillId,
        message: swapData.message
      });
      
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      setSwapData({ requestedSkillId: '', offeredSkillId: '', message: '' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send swap request';
      toast.error(message);
    } finally {
      setSwapLoading(false);
    }
  };

  const validateSwapRequest = () => {
    if (!swapData.requestedSkillId) {
      return { valid: false, message: 'Please select a skill you want' };
    }
    if (!swapData.offeredSkillId) {
      return { valid: false, message: 'Please select a skill you\'re offering' };
    }
    return { valid: true };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
        <Link to="/browse" className="text-blue-600 hover:text-blue-700">
          Back to Browse Users
        </Link>
      </div>
    );
  }

  const offeredSkills = skills?.filter(skill => skill.type === 'offered') || [];
  const wantedSkills = skills?.filter(skill => skill.type === 'wanted') || [];
  const myOfferedSkills = mySkills?.filter(skill => skill.type === 'offered' && skill.isApproved) || [];
  const myWantedSkills = mySkills?.filter(skill => skill.type === 'wanted' && skill.isApproved) || [];

  console.log('🔍 Skills filtering:', {
    allSkills: skills,
    offeredSkills,
    wantedSkills,
    mySkills,
    myOfferedSkills,
    myWantedSkills
  });

  const swapValidation = validateSwapRequest();

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <img
            src={user.profilePhoto || '/default-avatar.png'}
            alt={user.name}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.location && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.location}
                  </div>
                )}
              </div>
              {currentUser._id !== userId && (
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Swap
                </button>
              )}
            </div>

            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold">
                  {user.rating?.average ? user.rating.average.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-600 ml-1">
                  ({user.rating?.count || 0} reviews)
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Member since {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>

            {/* Availability */}
            {user.availability && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {user.availability.weekends && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      Weekends
                    </span>
                  )}
                  {user.availability.evenings && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Evenings
                    </span>
                  )}
                  {user.availability.weekdays && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      Weekdays
                    </span>
                  )}
                  {user.availability.custom && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      {user.availability.custom}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offered Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Skills Offered</h2>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          
          {offeredSkills.length > 0 ? (
            <div className="space-y-3">
              {offeredSkills.map((skill) => (
                <div key={skill._id} className="skill-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'expert' ? 'bg-red-100 text-red-800' :
                      skill.level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                      skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No skills offered yet.</p>
          )}
        </div>

        {/* Wanted Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Skills Wanted</h2>
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          
          {wantedSkills.length > 0 ? (
            <div className="space-y-3">
              {wantedSkills.map((skill) => (
                <div key={skill._id} className="skill-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'expert' ? 'bg-red-100 text-red-800' :
                      skill.level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                      skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No skills wanted yet.</p>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Request Skill Swap with {user.name}
              </h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSwapRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You Want from {user.name}
                </label>
                <select
                  value={swapData.requestedSkillId}
                  onChange={(e) => setSwapData(prev => ({ ...prev, requestedSkillId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a skill</option>
                  {offeredSkills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.level})
                    </option>
                  ))}
                </select>
                {offeredSkills.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    No skills available
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You're Offering
                </label>
                <select
                  value={swapData.offeredSkillId}
                  onChange={(e) => setSwapData(prev => ({ ...prev, offeredSkillId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a skill</option>
                  {myOfferedSkills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.level})
                    </option>
                  ))}
                </select>
                {myOfferedSkills.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    You need to add skills to offer
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={swapData.message}
                  onChange={(e) => setSwapData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a personal message to explain your swap request..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {swapData.message.length}/1000 characters
                </p>
              </div>

              {/* Validation Message */}
              {!swapValidation.valid && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">{swapValidation.message}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={swapLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!swapValidation.valid || swapLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {swapLoading ? (
                    <>
                      <div className="loading-spinner-small mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 