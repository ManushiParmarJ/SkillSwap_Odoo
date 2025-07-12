import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingSkills, setPendingSkills] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    type: 'info'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, skillsRes, swapsRes, messagesRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/skills/admin/pending'),
        axios.get('/api/admin/swaps?limit=5'),
        axios.get('/api/admin/messages')
      ]);

      setStats(statsRes.data);
      setPendingSkills(skillsRes.data.skills);
      setRecentSwaps(swapsRes.data.swaps);
      setMessages(messagesRes.data.messages);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAction = async (skillId, action, reason = '') => {
    try {
      if (action === 'approve') {
        await axios.put(`/api/skills/admin/${skillId}/approve`);
        toast.success('Skill approved successfully!');
      } else if (action === 'reject') {
        await axios.put(`/api/skills/admin/${skillId}/reject`, { reason });
        toast.success('Skill rejected successfully!');
      }
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to process skill');
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/admin/messages', messageForm);
      toast.success('Message created successfully!');
      setShowMessageModal(false);
      setMessageForm({ title: '', content: '', type: 'info' });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to create message');
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.users?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Skills</p>
                <p className="text-2xl font-bold text-green-900">{stats.skills?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Swaps</p>
                <p className="text-2xl font-bold text-purple-900">{stats.swaps?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Pending Skills</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.skills?.pending || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'skills', label: 'Pending Skills', icon: Briefcase },
              { id: 'swaps', label: 'Recent Swaps', icon: MessageSquare },
              { id: 'messages', label: 'Platform Messages', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center w-full p-3 text-left bg-white rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-3 text-blue-600" />
                    Create Platform Message
                  </button>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="flex items-center w-full p-3 text-left bg-white rounded-lg hover:bg-gray-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                    Review Pending Skills
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Users</span>
                    <span className="font-medium">{stats.users?.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed Swaps</span>
                    <span className="font-medium">{stats.swaps?.completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pending Swaps</span>
                    <span className="font-medium">{stats.swaps?.pending || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Skills for Review</h3>
            {pendingSkills.length > 0 ? (
              <div className="space-y-4">
                {pendingSkills.map((skill) => (
                  <div key={skill._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <p className="text-sm text-gray-600">by {skill.user.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSkillAction(skill._id, 'approve')}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleSkillAction(skill._id, 'reject')}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {skill.type}</span>
                      <span>Level: {skill.level}</span>
                      <span>Category: {skill.category || 'None'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending skills to review.</p>
            )}
          </div>
        )}

        {activeTab === 'swaps' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Swaps</h3>
            {recentSwaps.length > 0 ? (
              <div className="space-y-4">
                {recentSwaps.map((swap) => (
                  <div key={swap._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{swap.requester.name}</span>
                        <span className="text-gray-500">↔</span>
                        <span className="text-sm font-medium">{swap.recipient.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                        swap.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {swap.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{swap.offeredSkill.name}</span>
                      {' '}for{' '}
                      <span className="font-medium">{swap.requestedSkill.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent swaps.</p>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Platform Messages</h3>
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Message
              </button>
            </div>
            
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{message.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          message.type === 'alert' ? 'bg-red-100 text-red-800' :
                          message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          message.type === 'update' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No platform messages.</p>
            )}
          </div>
        )}
      </div>

      {/* Create Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Platform Message</h3>
            
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={messageForm.type}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 