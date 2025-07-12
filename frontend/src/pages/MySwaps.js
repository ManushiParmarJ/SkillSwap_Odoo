import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Check, 
  X, 
  Clock, 
  Star,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User
} from 'lucide-react';

const MySwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [ratingModal, setRatingModal] = useState({ show: false, swapId: null, rating: 0, comment: '' });

  useEffect(() => {
    fetchSwaps();
  }, [statusFilter]);

  const fetchSwaps = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await axios.get(`/api/swaps/my-swaps?${params}`);
      setSwaps(response.data.swaps);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast.error('Failed to load swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAction = async (swapId, action) => {
    setActionLoading(swapId);
    
    try {
      await axios.put(`/api/swaps/${swapId}/${action}`);
      toast.success(`Swap ${action}ed successfully!`);
      fetchSwaps();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} swap`;
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateSwap = async (e) => {
    e.preventDefault();
    
    if (!ratingModal.rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await axios.post(`/api/swaps/${ratingModal.swapId}/rate`, { 
        rating: ratingModal.rating, 
        comment: ratingModal.comment 
      });
      toast.success('Rating submitted successfully!');
      setRatingModal({ show: false, swapId: null, rating: 0, comment: '' });
      fetchSwaps();
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'accepted': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSwapRole = (swap) => {
    // This would need to be implemented based on current user context
    return 'requester'; // Placeholder
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Swaps</h1>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {swaps.length > 0 ? (
          <div className="space-y-4">
            {swaps.map((swap) => (
              <div key={swap._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {swap.requester._id === swap.recipient._id ? 'You' : swap.requester.name}
                      </span>
                      <span className="text-gray-500">↔</span>
                      <span className="text-sm font-medium text-gray-900">
                        {swap.recipient._id === swap.requester._id ? 'You' : swap.recipient.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(swap.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSwap(swap);
                        setShowSwapModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{swap.offeredSkill.name}</span>
                  {' '}for{' '}
                  <span className="font-medium">{swap.requestedSkill.name}</span>
                </div>

                {swap.message && (
                  <p className="text-sm text-gray-600 mb-3 italic">
                    "{swap.message}"
                  </p>
                )}

                {/* Action Buttons */}
                {swap.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    {swap.recipient._id !== swap.requester._id && (
                      <>
                        <button
                          onClick={() => handleSwapAction(swap._id, 'accept')}
                          disabled={actionLoading === swap._id}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === swap._id ? (
                            <div className="loading-spinner-small mr-1"></div>
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleSwapAction(swap._id, 'reject')}
                          disabled={actionLoading === swap._id}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === swap._id ? (
                            <div className="loading-spinner-small mr-1"></div>
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                    {swap.requester._id !== swap.recipient._id && (
                      <button
                        onClick={() => handleSwapAction(swap._id, 'cancel')}
                        disabled={actionLoading === swap._id}
                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === swap._id ? (
                          <div className="loading-spinner-small mr-1"></div>
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {swap.status === 'accepted' && (
                  <button
                    onClick={() => handleSwapAction(swap._id, 'complete')}
                    disabled={actionLoading === swap._id}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === swap._id ? (
                      <div className="loading-spinner-small mr-1"></div>
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Mark Complete
                  </button>
                )}

                {swap.status === 'completed' && !swap.rating?.fromRequester && !swap.rating?.fromRecipient && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rate this swap:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setRatingModal({ 
                          show: true, 
                          swapId: swap._id, 
                          rating: rating, 
                          comment: '' 
                        })}
                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Show existing ratings */}
                {swap.status === 'completed' && (swap.rating?.fromRequester || swap.rating?.fromRecipient) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600 mb-1">Ratings:</p>
                    {swap.rating.fromRequester && (
                      <div className="flex items-center text-xs text-gray-600">
                        <span>Requester: {swap.rating.fromRequester.rating}/5</span>
                        {swap.rating.fromRequester.comment && (
                          <span className="ml-2 italic">"{swap.rating.fromRequester.comment}"</span>
                        )}
                      </div>
                    )}
                    {swap.rating.fromRecipient && (
                      <div className="flex items-center text-xs text-gray-600">
                        <span>Recipient: {swap.rating.fromRecipient.rating}/5</span>
                        {swap.rating.fromRecipient.comment && (
                          <span className="ml-2 italic">"{swap.rating.fromRecipient.comment}"</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps yet</h3>
            <p className="text-gray-600">
              Start by browsing users and requesting skill swaps!
            </p>
          </div>
        )}
      </div>

      {/* Swap Details Modal */}
      {showSwapModal && selectedSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Swap Details</h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(selectedSwap.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSwap.status)}`}>
                    {selectedSwap.status.charAt(0).toUpperCase() + selectedSwap.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Requested:</span>
                <p className="text-sm text-gray-900 mt-1">{selectedSwap.requestedSkill.name}</p>
                {selectedSwap.requestedSkill.description && (
                  <p className="text-xs text-gray-600 mt-1">{selectedSwap.requestedSkill.description}</p>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Offered:</span>
                <p className="text-sm text-gray-900 mt-1">{selectedSwap.offeredSkill.name}</p>
                {selectedSwap.offeredSkill.description && (
                  <p className="text-xs text-gray-600 mt-1">{selectedSwap.offeredSkill.description}</p>
                )}
              </div>

              {selectedSwap.message && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                  <p className="text-sm text-gray-900 mt-1 italic">"{selectedSwap.message}"</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Created: {new Date(selectedSwap.createdAt).toLocaleDateString()}</span>
                {selectedSwap.completedAt && (
                  <span>Completed: {new Date(selectedSwap.completedAt).toLocaleDateString()}</span>
                )}
              </div>

              {selectedSwap.status === 'completed' && selectedSwap.rating && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ratings:</h4>
                  {selectedSwap.rating.fromRequester && (
                    <div className="text-sm text-gray-600">
                      <span>From requester: {selectedSwap.rating.fromRequester.rating}/5</span>
                      {selectedSwap.rating.fromRequester.comment && (
                        <p className="text-xs italic mt-1">"{selectedSwap.rating.fromRequester.comment}"</p>
                      )}
                    </div>
                  )}
                  {selectedSwap.rating.fromRecipient && (
                    <div className="text-sm text-gray-600">
                      <span>From recipient: {selectedSwap.rating.fromRecipient.rating}/5</span>
                      {selectedSwap.rating.fromRecipient.comment && (
                        <p className="text-xs italic mt-1">"{selectedSwap.rating.fromRecipient.comment}"</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate This Swap</h3>
            
            <form onSubmit={handleRateSwap} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setRatingModal(prev => ({ ...prev, rating }))}
                      className={`p-2 rounded ${
                        ratingModal.rating >= rating 
                          ? 'text-yellow-500' 
                          : 'text-gray-300'
                      } hover:text-yellow-500 transition-colors`}
                    >
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {ratingModal.rating === 0 ? 'Select a rating' : `${ratingModal.rating} out of 5 stars`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={ratingModal.comment}
                  onChange={(e) => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ratingModal.comment.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRatingModal({ show: false, swapId: null, rating: 0, comment: '' })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!ratingModal.rating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySwaps; 