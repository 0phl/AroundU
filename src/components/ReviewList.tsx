import React, { useEffect, useState, Fragment } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { useReviewStore } from '../stores/reviewStore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react';

interface ReviewListProps {
  businessId: string;
}

export default function ReviewList({ businessId }: ReviewListProps) {
  const { reviews, loading, error, deleteReview, fetchReviews, clearError, editReview } = useReviewStore();
  const { user } = useAuth();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        console.log('ReviewList: Loading reviews for business:', businessId);
        clearError();
        await fetchReviews(businessId);
      } catch (error) {
        console.error('ReviewList: Error loading reviews:', error);
      }
    };

    if (businessId) {
      loadReviews();
    }
  }, [businessId, fetchReviews, clearError]);

  const handleRetry = async () => {
    try {
      clearError();
      await fetchReviews(businessId);
    } catch (error) {
      console.error('ReviewList: Error retrying review load:', error);
    }
  };

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const handleDeleteClick = (reviewId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to delete reviews');
      return;
    }
    setReviewToDelete(reviewId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setDeletingReviewId(reviewToDelete);
      await deleteReview(reviewToDelete, businessId);
      await fetchReviews(businessId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete review');
      }
    } finally {
      setDeletingReviewId(null);
      setReviewToDelete(null);
    }
  };

  // Function to discretize user name
  const getDiscreteName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return 'Anonymous';
    
    const firstName = parts[0];
    return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1, 3)}***`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex space-x-4 bg-white p-6 rounded-lg shadow-sm">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={handleRetry}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Retry Loading Reviews
        </button>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">No reviews yet</p>
        <p className="mt-2 text-sm text-gray-500">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* User Avatar */}
            <div className="flex items-center sm:items-start gap-3 sm:gap-4">
              {review.userPhotoURL ? (
                <img
                  src={review.userPhotoURL}
                  alt={review.userName}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Mobile User Info */}
              <div className="sm:hidden">
                <h4 className="text-sm font-medium text-gray-900">
                  {getDiscreteName(review.userName)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="flex-1 min-w-0">
              {/* Desktop User Info */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {getDiscreteName(review.userName)}
                    </h4>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  {(user?.id === review.userId || user?.role === 'admin') && !editingReview && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(review.id)}
                        className={`text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 ${
                          deletingReviewId === review.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={deletingReviewId === review.id}
                      >
                        {deletingReviewId === review.id ? (
                          <div className="flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Deleting...
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingReview?.id === review.id ? (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditingReview({
                          ...editingReview,
                          rating: value
                        })}
                        className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <StarIcon
                          className={`h-6 w-6 ${
                            value <= editingReview.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editingReview.text}
                    onChange={(e) =>
                      setEditingReview({
                        ...editingReview,
                        text: e.target.value
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Update your review..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await editReview(review.id, {
                            rating: editingReview.rating,
                            text: editingReview.text.trim()
                          });
                          setEditingReview(null);
                        } catch (error) {
                          console.error('Failed to update review:', error);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-gray-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                    {review.text}
                  </p>
                  
                  {/* Mobile Actions */}
                  {(user?.id === review.userId || user?.role === 'admin') && !editingReview && (
                    <div className="mt-3 flex space-x-4 sm:hidden">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(review.id)}
                        className={`text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 ${
                          deletingReviewId === review.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={deletingReviewId === review.id}
                      >
                        {deletingReviewId === review.id ? (
                          <div className="flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Deleting...
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      {/* Delete Confirmation Dialog */}
      <Transition appear show={showDeleteDialog} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowDeleteDialog(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-lg bg-white p-4 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-sm font-medium text-gray-900">
                    Delete Review?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Are you sure you want to delete this review?
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
