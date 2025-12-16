import React from 'react';

function ProfileModal({ user, onClose }) {

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <div className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300">
              {user?.username || 'Not specified'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
            <div className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300">
              {user?.gender || 'Not specified'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <div className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300">
              {user?.country || 'Not specified'}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;