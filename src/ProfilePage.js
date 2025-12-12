import React, { useState, useEffect } from 'react';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

function ProfilePage({ currentUsername, currentUserId, onBack }) {
  const [profile, setProfile] = useState({
    username: currentUsername || '',
    gender: '',
    country: '',
    interests: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    // Load profile from localStorage or API
    const savedProfile = localStorage.getItem(`profile_${currentUserId}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({ ...parsed, username: currentUsername });
      setEditedProfile({ ...parsed, username: currentUsername });
    }
  }, [currentUserId, currentUsername]);

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem(`profile_${currentUserId}`, JSON.stringify(editedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <BackIcon />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <h1 className="text-lg font-bold text-white">Profile</h1>
        
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-sm"
        >
          <EditIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </header>

      {/* Profile Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
              <span className="text-3xl font-bold text-white">
                {getInitials(profile.username)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{profile.username}</h2>
            <p className="text-zinc-500 text-sm">ID: {currentUserId?.slice(-8)}</p>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            
            {/* Gender */}
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Gender</label>
              {isEditing ? (
                <select
                  value={editedProfile.gender}
                  onChange={(e) => setEditedProfile({...editedProfile, gender: e.target.value})}
                  className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 focus:border-blue-500 focus:ring-0"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="text-white">{profile.gender || 'Not specified'}</p>
              )}
            </div>

            {/* Country */}
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.country}
                  onChange={(e) => setEditedProfile({...editedProfile, country: e.target.value})}
                  placeholder="Enter your country"
                  className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 focus:border-blue-500 focus:ring-0"
                />
              ) : (
                <p className="text-white">{profile.country || 'Not specified'}</p>
              )}
            </div>

            {/* Interests */}
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <label className="block text-zinc-400 text-sm font-medium mb-2">Interests</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.interests}
                  onChange={(e) => setEditedProfile({...editedProfile, interests: e.target.value})}
                  placeholder="Tell others about your interests..."
                  rows={3}
                  className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 focus:border-blue-500 focus:ring-0 resize-none"
                />
              ) : (
                <p className="text-white">{profile.interests || 'No interests added yet'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;