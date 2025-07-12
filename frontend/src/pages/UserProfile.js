import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  MapPin, 
  Star, 
  Calendar, 
  MessageSquare, 
  Briefcase,
  Plus,
  Clock
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapData, setSwapData] = useState({
    requestedSkillId: '',
    offeredSkillId: '',
    message: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data.user);
      setSkills(response.data.skills);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/swaps', {
        recipientId: userId,
        requestedSkillId: swapData.requestedSkillId,
        offeredSkillId: swapData.offeredSkillId,
        message: swapData.message
      });
      
      setShowSwapModal(false);
      setSwapData({ requestedSkillId: '', offeredSkillId: '', message: '' });
      // You could show a success message here
    } catch (error) {
      console.error('Error creating swap request:', error);
    }
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

  const offeredSkills = skills.filter(skill => skill.type === 'offered');
  const wantedSkills = skills.filter(skill => skill.type === 'wanted');

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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Request Skill Swap with {user.name}
            </h3>
            
            <form onSubmit={handleSwapRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You Want
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
                  {wantedSkills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.level})
                    </option>
                  ))}
                </select>
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
                  placeholder="Add a personal message..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Request
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