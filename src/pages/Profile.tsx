import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { PencilIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  bio: string;
  interests: string[];
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    bio: '',
    interests: []
  });
  const [newInterest, setNewInterest] = useState('');
  const [editingBio, setEditingBio] = useState(false);

  // Fetch user data including profile picture on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfilePicture(userData.profilePicture || '');
          setProfile({
            bio: userData.bio || '',
            interests: userData.interests || []
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
    };
    fetchUserData();
  }, [user?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user?.id) {
      toast.error('Please select an image to upload');
      return;
    }
    
    setLoading(true);
    const file = e.target.files[0];
    
    try {
      // Convert image to Base64
      const base64 = await convertToBase64(file);
      
      // Update user profile picture in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        profilePicture: base64,
        updatedAt: new Date()
      });
      
      setProfilePicture(base64);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to convert file to Base64 with compression
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Compress image if it's too large
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions (max 400px width/height to save space)
            let width = img.width;
            let height = img.height;
            const maxSize = 400;
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height / width) * maxSize;
                width = maxSize;
              } else {
                width = (width / height) * maxSize;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to Base64 with higher compression
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressedBase64);
          };
        } else {
          reject(new Error('Failed to convert image to Base64'));
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateBio = async (newBio: string) => {
    if (!user?.id) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        bio: newBio,
        updatedAt: new Date()
      });
      setProfile(prev => ({ ...prev, bio: newBio }));
      toast.success('Bio updated successfully!');
      setEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
      toast.error('Failed to update bio');
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim() || !user?.id) return;
    try {
      const updatedInterests = [...profile.interests, newInterest.trim()];
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        interests: updatedInterests,
        updatedAt: new Date()
      });
      setProfile(prev => ({ ...prev, interests: updatedInterests }));
      setNewInterest('');
      toast.success('Interest added successfully!');
    } catch (error) {
      console.error('Error adding interest:', error);
      toast.error('Failed to add interest');
    }
  };

  const handleRemoveInterest = async (interest: string) => {
    if (!user?.id) return;
    try {
      const updatedInterests = profile.interests.filter(i => i !== interest);
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        interests: updatedInterests,
        updatedAt: new Date()
      });
      setProfile(prev => ({ ...prev, interests: updatedInterests }));
      toast.success('Interest removed successfully!');
    } catch (error) {
      console.error('Error removing interest:', error);
      toast.error('Failed to remove interest');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture and Basic Info */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-4xl text-gray-400">
                        {user?.firstName?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                {user?.studentId && (
                  <p className="text-gray-500 text-sm mt-1">
                    Student ID: {user.studentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="md:col-span-2">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
                <button
                  onClick={() => setEditingBio(!editingBio)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  {editingBio ? (
                    <div className="mt-1">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingBio(false)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateBio(profile.bio)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-600">
                      {profile.bio || 'No bio added yet'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interests</label>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add new interest"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      />
                      <button
                        onClick={handleAddInterest}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}