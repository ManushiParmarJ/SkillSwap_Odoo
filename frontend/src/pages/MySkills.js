import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Briefcase, 
  Users,
  X,
  Save
} from 'lucide-react';

const MySkills = () => {
  const [skills, setSkills] = useState({ offeredSkills: [], wantedSkills: [] });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'offered',
    level: 'intermediate'
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get('/api/skills/my-skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSkill) {
        await axios.put(`/api/skills/${editingSkill._id}`, formData);
        toast.success('Skill updated successfully!');
      } else {
        await axios.post('/api/skills', formData);
        toast.success('Skill added successfully!');
      }
      
      setShowAddModal(false);
      setEditingSkill(null);
      resetForm();
      fetchSkills();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save skill';
      toast.error(message);
    }
  };

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await axios.delete(`/api/skills/${skillId}`);
      toast.success('Skill deleted successfully!');
      fetchSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || '',
      category: skill.category || '',
      type: skill.type,
      level: skill.level
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      type: 'offered',
      level: 'intermediate'
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSkill(null);
    resetForm();
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offered Skills */}
          <div>
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Skills I Offer</h2>
            </div>
            
            {skills.offeredSkills.length > 0 ? (
              <div className="space-y-3">
                {skills.offeredSkills.map((skill) => (
                  <div key={skill._id} className="skill-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{skill.name}</h3>
                        {skill.description && (
                          <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                        )}
                        {skill.category && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mt-2">
                            {skill.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          skill.level === 'expert' ? 'bg-red-100 text-red-800' :
                          skill.level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                          skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {skill.level}
                        </span>
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No skills offered yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first skill
                </button>
              </div>
            )}
          </div>

          {/* Wanted Skills */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Skills I Want</h2>
            </div>
            
            {skills.wantedSkills.length > 0 ? (
              <div className="space-y-3">
                {skills.wantedSkills.map((skill) => (
                  <div key={skill._id} className="skill-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{skill.name}</h3>
                        {skill.description && (
                          <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                        )}
                        {skill.category && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mt-2">
                            {skill.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          skill.level === 'expert' ? 'bg-red-100 text-red-800' :
                          skill.level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                          skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {skill.level}
                        </span>
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No skills wanted yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Add skills you want to learn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Cooking, Photography"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your skill or what you want to learn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Technology, Arts, Business"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="offered">I Offer This</option>
                    <option value="wanted">I Want This</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkills; 