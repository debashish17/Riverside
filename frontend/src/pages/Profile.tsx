// Profile page component
import React from 'react';
import { User } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.username || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email || 'No email provided'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Profile management features coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;