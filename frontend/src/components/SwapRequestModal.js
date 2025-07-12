import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  User,
  MessageSquare,
  Star
} from 'lucide-react';

const SwapRequestModal = ({ 
  isOpen, 
  onClose, 
  recipient, 
  recipientSkills, 
  mySkills,
  onSuccess 
}) => {
  const [swapData, setSwapData] = useState({
    requestedSkillId: '',
    offeredSkillId: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({ valid: true, message: '' });

  useEffect(() => {
    if (isOpen) {
      setSwapData({ requestedSkillId: '', offeredSkillId: '', message: '' });
      setValidation({ valid: true, message: '' });
    }
  }, [isOpen]);

  const validateForm = () => {
    if (!swapData.requestedSkillId) {
      return { valid: false, message: 'Please select a skill you want' };
    }
    if (!swapData.offeredSkillId) {
      return { valid: false, message: 'Please select a skill you\'re offering' };
    }
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationResult = validateForm();
    setValidation(validationResult);
    
    if (!validationResult.valid) {
      toast.error(validationResult.message);
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/swaps', {
        recipientId: recipient._id,
        requestedSkillId: swapData.requestedSkillId,
        offeredSkillId: swapData.offeredSkillId,
        message: swapData.message
      });
      
      toast.success('Swap request sent successfully!');
      onSuccess && onSuccess(response.data.swap);
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send swap request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const offeredSkills = recipientSkills.filter(skill => skill.type === 'offered' && skill.isApproved);
  const myOfferedSkills = mySkills.filter(skill => skill.type === 'offered' && skill.isApproved);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Skill Swap
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recipient Info */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <img
            src={recipient.profilePhoto || '/default-avatar.png'}
            alt={recipient.name}
            className="h-10 w-10 rounded-full object-cover mr-3"
          />
          <div>
            <h4 className="font-medium text-gray-900">{recipient.name}</h4>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-3 w-3 mr-1" />
              <span>
                {recipient.rating?.average ? recipient.rating.average.toFixed(1) : 'N/A'} 
                ({recipient.rating?.count || 0} reviews)
              </span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill You Want from {recipient.name}
            </label>
            <select
              value={swapData.requestedSkillId}
              onChange={(e) => {
                setSwapData(prev => ({ ...prev, requestedSkillId: e.target.value }));
                setValidation({ valid: true, message: '' });
              }}
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
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                No approved skills available
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill You're Offering
            </label>
            <select
              value={swapData.offeredSkillId}
              onChange={(e) => {
                setSwapData(prev => ({ ...prev, offeredSkillId: e.target.value }));
                setValidation({ valid: true, message: '' });
              }}
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
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                You need to add approved skills to offer
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
          {!validation.valid && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{validation.message}</span>
            </div>
          )}

          {/* Swap Preview */}
          {swapData.requestedSkillId && swapData.offeredSkillId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Swap Preview:</h4>
              <div className="text-sm text-blue-800">
                <div className="flex items-center justify-between">
                  <span>You offer:</span>
                  <span className="font-medium">
                    {myOfferedSkills.find(s => s._id === swapData.offeredSkillId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>You receive:</span>
                  <span className="font-medium">
                    {offeredSkills.find(s => s._id === swapData.requestedSkillId)?.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validateForm().valid || loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal; 