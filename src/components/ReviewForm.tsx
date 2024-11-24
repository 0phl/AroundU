import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { useReviewStore } from '../stores/reviewStore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ReviewFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ businessId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addReview } = useReviewStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!text.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the user's profile picture
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const userPhotoURL = userDoc.exists() ? userDoc.data().profilePicture : null;

      await addReview({
        businessId,
        userId: user.id,
        userName: user.displayName,
        userPhotoURL,
        rating,
        text: text.trim()
      });
      
      toast.success('Review submitted successfully!');
      setText('');
      setRating(0);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      {/* Rating Stars */}
      <div className="flex flex-col items-center space-y-2">
        <label className="text-sm font-medium text-gray-700">Your Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 focus:outline-none"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
            >
              <StarIcon
                className={`h-8 w-8 ${
                  (hoverRating || rating) >= value
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label
          htmlFor="review-text"
          className="block text-sm font-medium text-gray-700"
        >
          Your Review
        </label>
        <div className="mt-1">
          <textarea
            id="review-text"
            name="review-text"
            rows={4}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md resize-none"
            placeholder="Tell others what you think about this business..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
