import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  runTransaction, 
  getDoc,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Review, Business } from '../types';
import { useBusinessStore } from './businessStore';
import toast from 'react-hot-toast';

interface ReviewStore {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (businessId: string) => Promise<void>;
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'userPhotoURL'>) => Promise<void>;
  editReview: (reviewId: string, reviewData: { rating: number; text: string }) => Promise<void>;
  deleteReview: (reviewId: string, businessId: string) => Promise<void>;
  clearError: () => void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchReviews: async (businessId: string) => {
    if (!businessId) {
      console.error('fetchReviews: businessId is required');
      set({ error: 'Business ID is required', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('Fetching reviews for business:', businessId);
      const reviewsRef = collection(db, 'reviews');
      
      let q = query(
        reviewsRef,
        where('businessId', '==', businessId)
      );
      
      try {
        q = query(
          reviewsRef,
          where('businessId', '==', businessId),
          orderBy('createdAt', 'desc')
        );
      } catch (indexError) {
        console.warn('Index not found, falling back to unordered query:', indexError);
      }
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('Query completed, processing results...');
      
      let reviews = await Promise.all(querySnapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        
        // Get user photo URL
        let userPhotoURL = null;
        try {
          const userDocRef = doc(db, 'users', data.userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userPhotoURL = userData.profilePicture || null;
          }
        } catch (error) {
          console.warn('Could not fetch user photo:', error);
        }
        
        return {
          id: docSnapshot.id,
          businessId: data.businessId,
          userId: data.userId,
          userName: data.userName,
          userPhotoURL,
          rating: data.rating,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Review;
      }));

      // If we couldn't use orderBy in the query, sort the results in memory
      if (!q.toString().includes('orderBy')) {
        reviews = reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      console.log('Processed reviews:', reviews);
      set({ reviews, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error instanceof Error && error.message.includes('index')) {
        const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
        if (indexUrl) {
          set({ 
            error: `Please create the required index by visiting: ${indexUrl}`,
            loading: false 
          });
        } else {
          set({ error: 'Missing required index for this query', loading: false });
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
        set({ error: errorMessage, loading: false });
      }
    }
  },

  addReview: async (reviewData) => {
    try {
      const { businessId, userId } = reviewData;
      const businessRef = doc(db, 'businesses', businessId);
      const reviewsRef = collection(db, 'reviews');
      const userRef = doc(db, 'users', userId);

      // First check if the user has already reviewed this business
      const existingReviewQuery = query(
        reviewsRef,
        where('businessId', '==', businessId),
        where('userId', '==', userId)
      );
      
      const existingReviews = await getDocs(existingReviewQuery);
      if (!existingReviews.empty) {
        throw new Error('You have already reviewed this business');
      }

      await runTransaction(db, async (transaction) => {
        // Verify business exists
        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) {
          throw new Error('Business not found');
        }

        // Get user data for the photo URL
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const userData = userDoc.data();

        // Create a new document reference
        const newReviewRef = doc(reviewsRef);
        const now = Timestamp.now();
        const newReview = {
          ...reviewData,
          id: newReviewRef.id,
          userPhotoURL: userData?.profilePicture || null,
          createdAt: now,
          updatedAt: now
        };

        // Add the review using transaction
        transaction.set(newReviewRef, newReview);

        // Update business rating and review count
        const businessData = businessDoc.data();
        const currentRating = businessData?.rating || 0;
        const currentReviewCount = businessData?.reviewCount || 0;
        
        // Calculate new rating
        const newRating = ((currentRating * currentReviewCount) + reviewData.rating) / (currentReviewCount + 1);
        
        // Update business document
        const updateData = {
          rating: Number(newRating.toFixed(1)),
          reviewCount: currentReviewCount + 1,
          updatedAt: now.toDate()
        } as Partial<Business>;
        
        transaction.update(businessRef, updateData);

        // Update local state with the new review
        set(state => ({
          reviews: [
            {
              ...newReview,
              createdAt: newReview.createdAt.toDate(),
              updatedAt: newReview.updatedAt.toDate()
            } as Review,
            ...state.reviews
          ]
        }));

        // Update business store
        const businessStore = useBusinessStore.getState();
        businessStore.updateBusiness(businessId, updateData);
      });

      toast.success('Review submitted');
    } catch (error) {
      console.error('Error adding review:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit review');
      }
      throw error;
    }
  },

  editReview: async (reviewId: string, reviewData: { rating: number; text: string }) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const review = reviewDoc.data();
      const businessRef = doc(db, 'businesses', review.businessId);

      await runTransaction(db, async (transaction) => {
        // Get the business to update rating
        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) {
          throw new Error('Business not found');
        }

        // Calculate new business rating
        const businessData = businessDoc.data();
        const oldRating = review.rating;
        const newRating = reviewData.rating;
        const reviewCount = businessData.reviewCount || 0;
        
        // Update total rating
        const currentTotalRating = businessData.rating * reviewCount;
        const newTotalRating = currentTotalRating - oldRating + newRating;
        const updatedBusinessRating = Number((newTotalRating / reviewCount).toFixed(1));

        // Update the review
        const now = Timestamp.now();
        transaction.update(reviewRef, {
          ...reviewData,
          updatedAt: now
        });

        // Update business rating
        transaction.update(businessRef, {
          rating: updatedBusinessRating,
          updatedAt: now
        });

        // Update local state
        set(state => ({
          reviews: state.reviews.map(r => 
            r.id === reviewId 
              ? { 
                  ...r, 
                  ...reviewData, 
                  updatedAt: now.toDate() 
                }
              : r
          )
        }));
      });

      toast.success('Review updated');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
      throw error;
    }
  },

  deleteReview: async (reviewId: string, businessId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const businessRef = doc(db, 'businesses', businessId);

      await runTransaction(db, async (transaction) => {
        // Get the review to get its rating
        const reviewDoc = await transaction.get(reviewRef);
        if (!reviewDoc.exists()) {
          throw new Error('Review not found');
        }

        // Get the business to update rating
        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) {
          throw new Error('Business not found');
        }

        const review = reviewDoc.data();
        const businessData = businessDoc.data();
        const reviewCount = businessData.reviewCount - 1;
        
        // Calculate new business rating
        let updatedRating = 0;
        if (reviewCount > 0) {
          const currentTotalRating = businessData.rating * businessData.reviewCount;
          const newTotalRating = currentTotalRating - review.rating;
          updatedRating = Number((newTotalRating / reviewCount).toFixed(1));
        }

        // Delete the review
        transaction.delete(reviewRef);

        // Update business rating and review count
        transaction.update(businessRef, {
          rating: updatedRating,
          reviewCount: reviewCount,
          updatedAt: Timestamp.now()
        });

        // Update local state
        set(state => ({
          reviews: state.reviews.filter(r => r.id !== reviewId)
        }));
      });

      toast.success('Review deleted');
    } catch (error) {
      console.error('Error deleting review:', error);
      let errorMessage = 'Failed to delete review';
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Permission denied';
        } else if (error.message.includes('not-found')) {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }
}));
