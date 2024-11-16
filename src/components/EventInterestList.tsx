import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';

interface EventInterestListProps {
  eventId: string;
  businessName: string;
}

interface InterestedUser extends User {
  interestedAt: Date;
}

export default function EventInterestList({ eventId, businessName }: EventInterestListProps) {
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterestedUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const interestedUsers: InterestedUser[] = [];
        
        // Query all users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        // For each user, check if they're interested in this event
        for (const userDoc of usersSnapshot.docs) {
          const interestedEventRef = collection(db, 'users', userDoc.id, 'interestedEvents');
          const eventQuery = query(interestedEventRef, where('eventId', '==', eventId));
          const eventSnapshot = await getDocs(eventQuery);
          
          if (!eventSnapshot.empty) {
            const userData = userDoc.data();
            const interestData = eventSnapshot.docs[0].data();
            interestedUsers.push({
              id: userDoc.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              studentId: userData.studentId,
              interestedAt: interestData.interestedAt.toDate(),
            });
          }
        }
        
        // Sort by most recent first
        interestedUsers.sort((a, b) => b.interestedAt.getTime() - a.interestedAt.getTime());
        setInterestedUsers(interestedUsers);
      } catch (err) {
        console.error('Error fetching interested users:', err);
        setError('Failed to load interested users');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchInterestedUsers();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Interested Users - {businessName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {interestedUsers.length} user(s) interested in this event
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {interestedUsers.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                    {user.studentId && (
                      <div className="text-sm text-gray-500">
                        Student ID: {user.studentId}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Interested {new Date(user.interestedAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
