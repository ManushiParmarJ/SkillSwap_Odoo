import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  Star, 
  Plus,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    offeredSkills: 0,
    wantedSkills: 0,
    completedSwaps: 0,
    pendingSwaps: 0
  });
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, swapsResponse] = await Promise.all([
        axios.get(`/api/users/stats/${user._id}`),
        axios.get('/api/swaps/my-swaps?limit=5')
      ]);

      setStats(statsResponse.data);
      setRecentSwaps(swapsResponse.data.swaps);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to share your skills and learn from others?
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{user.location || 'Location not set'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offered Skills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offeredSkills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wanted Skills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wantedSkills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rating?.average ? stats.rating.average.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/my-skills"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Skills</h3>
              <p className="text-gray-600 mt-2">Add, edit, or remove your skills</p>
            </div>
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
        </Link>

        <Link
          to="/browse"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Users</h3>
              <p className="text-gray-600 mt-2">Find people to swap skills with</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Link>

        <Link
          to="/my-swaps"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Swaps</h3>
              <p className="text-gray-600 mt-2">View your swap requests</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Swaps</h2>
          <Link
            to="/my-swaps"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>

        {recentSwaps.length > 0 ? (
          <div className="space-y-4">
            {recentSwaps.map((swap) => (
              <div
                key={swap._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {swap.requester._id === user._id ? 'You' : swap.requester.name}
                      </span>
                      <span className="text-gray-500">↔</span>
                      <span className="text-sm font-medium text-gray-900">
                        {swap.recipient._id === user._id ? 'You' : swap.recipient.name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                      swap.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(swap.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">{swap.offeredSkill.name}</span>
                  {' '}for{' '}
                  <span className="font-medium">{swap.requestedSkill.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No swaps yet. Start by browsing users!</p>
            <Link
              to="/browse"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse Users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 