import React, { useState, useEffect } from 'react';
import StarRating from './components/StarRating';
import { api } from './api';
import PfpSelect from './components/PfpSelect';
import LoadingScreen from './components/LoadingScreen';
import TagInput from './TagInput';
import './TagInput.css';

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
    age: '',
    country: '',
    interests: [],
    pfp: '',
    pfp_background: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [ratingSummary, setRatingSummary] = useState({ average: null, count: 0 });
  const [ratingLoading, setRatingLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [showPfpSelect, setShowPfpSelect] = useState(false);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    let ignore = false;

    const loadProfileData = async () => {
      if (!currentUserId) {
        setPageLoading(false);
        setRatingLoading(false);
        return;
      }
      
      setRatingLoading(true);
      try {
        // Fetch full profile and rating data from the backend
        const [userProfile, ratingData, pfpData, friendsData, interestsData] = await Promise.all([
          api.getUser(currentUserId),
          api.getUserRating(currentUserId),
          api.getUserPfp(currentUserId).catch(() => null),
          api.getFriends(currentUserId).catch(() => []),
          api.getUserInterests(currentUserId).catch(() => []),
        ]);

        if (!ignore) {
          const pfpUrl = pfpData?.pfp || pfpData?.pfpLink || userProfile.pfp;
          const pfpBg = pfpData?.pfp_background || userProfile.pfp_background || '';
          const newProfile = { ...profile, ...userProfile, pfp: pfpUrl, username: userProfile.username || currentUsername, pfp_background: pfpBg, interests: interestsData };
          setProfile(newProfile);
          setEditedProfile(newProfile);

          setRatingSummary({
            average: ratingData.averageRating,
            count: ratingData.reviewCount
          });

          setFriends(friendsData);

          if (userProfile.blocked_users && userProfile.blocked_users.length > 0) {
            const blockedUsersData = await Promise.all(
              userProfile.blocked_users.map(id => api.getUser(id).catch(() => null))
            );
            setBlockedUsers(blockedUsersData.filter(Boolean));
          } else {
            setBlockedUsers([]);
          }
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        if (!ignore) {
          setRatingSummary({ average: null, count: 0 });
        }
      } finally {
        if (!ignore) {
          setRatingLoading(false);
          setPageLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      ignore = true;
    };
  }, [currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    // Optimistically update local state
    const oldProfile = { ...profile };
    setProfile(editedProfile);
    setIsEditing(false);

    // Save to backend so others can see it
    try {
      const promises = [];
      if (oldProfile.gender !== editedProfile.gender || oldProfile.country !== editedProfile.country || oldProfile.age !== editedProfile.age) {
        promises.push(api.updateUserDemographics(currentUserId, {
          gender: editedProfile.gender,
          country: editedProfile.country,
          age: editedProfile.age
        }));
      }
      if (oldProfile.pfp !== editedProfile.pfp || oldProfile.pfp_background !== editedProfile.pfp_background) {
        promises.push(api.updateUserPfp(currentUserId, editedProfile.pfp, editedProfile.pfp_background));
      }
      if (JSON.stringify(oldProfile.interests) !== JSON.stringify(editedProfile.interests)) {
        promises.push(api.sendUserInterests(currentUserId, editedProfile.interests));
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to save profile to backend:", error);
      // Revert optimistic update on failure
      setProfile(oldProfile);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleImageSave = ({ pfp, bg }) => {
    setEditedProfile({ ...editedProfile, pfp, pfp_background: bg });
    setShowPfpSelect(false);
  };

  const handleUnblock = async (blockedUserId) => {
    if (!currentUserId) return;
    try {
      await api.unblockUser(currentUserId, blockedUserId);
      setBlockedUsers(prev => prev.filter(u => u.id !== blockedUserId));
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  };

  if (pageLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#fefefe] flex flex-col font-sans relative overflow-hidden selection:bg-[#ffbd59]/30">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#ffbd59]/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ff907c]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-[#ffbd59]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10 relative">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#fefefe]/60 hover:text-[#fefefe] transition-colors"
        >
          <BackIcon />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <h1 className="text-sm font-bold text-[#fefefe]/40 uppercase tracking-widest">Profile</h1>
        
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fefefe]/5 border border-[#fefefe]/10 text-[#fefefe] hover:bg-[#fefefe]/10 transition-all text-xs font-medium backdrop-blur-sm"
        >
          <EditIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </header>

      {/* Profile Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto z-10 relative">
        <div className="max-w-lg mx-auto pb-10">
          
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10"> 
            <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffbd59] to-[#ff907c] rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
            <div 
              className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-black ${
                (isEditing ? editedProfile.pfp_background : profile.pfp_background) 
                  ? 'bg-black' 
                  : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'
              }`}
              style={
                (isEditing ? editedProfile.pfp_background : profile.pfp_background) 
                  ? { backgroundImage: `url(${isEditing ? editedProfile.pfp_background : profile.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}
              }
            >
              {(isEditing ? editedProfile.pfp : profile.pfp) ? (
                <img 
                  src={isEditing ? editedProfile.pfp : profile.pfp} 
                  alt="Profile" 
                  className="w-full h-full object-contain rounded-full z-10"
                />
              ) : (
                <span className="text-4xl font-bold text-[#fefefe] z-10">
                  {getInitials(profile.username)}
                </span>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={() => setShowPfpSelect(true)}
                    className="text-sm bg-[#fefefe]/20 hover:bg-[#fefefe]/30 px-4 py-2 rounded-lg text-[#fefefe] backdrop-blur-sm font-semibold"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            </div>
            <h2 className="text-3xl font-bold text-[#fefefe] mt-5 tracking-tight">{profile.username}</h2>
            <div className="mt-2 px-3 py-1 rounded-full bg-[#fefefe]/5 border border-[#fefefe]/5 text-[10px] text-[#fefefe]/60 font-mono tracking-wider">
              ID: {currentUserId?.slice(-8)}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            
            {/* Grid for Age, Gender & Country */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-5 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-1">Age</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={editedProfile.age || ''} 
                    onChange={(e) => setEditedProfile({...editedProfile, age: e.target.value})}
                    className="w-full bg-transparent text-lg font-medium text-[#fefefe] focus:outline-none border-b border-[#fefefe]/20 focus:border-[#ffbd59] p-0"
                  />
                ) : (
                  <p className="text-lg font-medium text-[#fefefe]">{profile.age || 'N/A'}</p>
                )}
              </div>

              <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-5 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-1">Gender</label>
                {isEditing ? (
                  <select 
                    value={editedProfile.gender || ''} 
                    onChange={(e) => setEditedProfile({...editedProfile, gender: e.target.value})}
                    className="w-full bg-transparent text-lg font-medium text-[#fefefe] focus:outline-none border-b border-[#fefefe]/20 focus:border-[#ffbd59] p-0 [&>option]:text-black"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium text-[#fefefe] capitalize">{profile.gender || 'N/A'}</p>
                )}
              </div>

              <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-5 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-1">Country</label>
                {isEditing ? (
                  <input type="text" value={editedProfile.country || ''} onChange={(e) => setEditedProfile({...editedProfile, country: e.target.value})} className="w-full bg-transparent text-lg font-medium text-[#fefefe] focus:outline-none border-b border-[#fefefe]/20 focus:border-[#ffbd59] p-0" />
                ) : (
                  <p className="text-lg font-medium text-[#fefefe] truncate">{profile.country || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-6 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
              <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-3">Interests</label>
              {isEditing ? (
                <TagInput
                  tags={editedProfile.interests}
                  onTagsChange={(newTags) => setEditedProfile({...editedProfile, interests: newTags})}
                />
              ) : profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1.5 bg-[#fefefe]/10 text-[#fefefe] text-xs font-medium rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#fefefe]/40 text-sm italic">No interests added yet.</p>
              )}
            </div>

            {/* Your Reviews */}
            <div className="bg-gradient-to-br from-[#fefefe]/5 to-[#fefefe]/5 backdrop-blur-md rounded-2xl p-6 border border-[#fefefe]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbd59]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-3 relative z-10">Community Rating</label>
              {ratingLoading ? (
                <div className="h-6 w-24 bg-[#fefefe]/10 rounded animate-pulse"></div>
              ) : ratingSummary.count > 0 ? (
                <div className="flex items-end gap-3 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-[#fefefe] leading-none">{Number(ratingSummary.average || 0).toFixed(1)}</span>
                    <span className="text-[10px] text-[#fefefe]/40 font-medium mt-1">{ratingSummary.count} review{ratingSummary.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mb-1">
                    <StarRating rating={ratingSummary.average} size="md" />
                  </div>
                </div>
              ) : (
                <p className="text-[#fefefe]/40 text-sm italic relative z-10">No reviews yet. Chat to get rated!</p>
              )}
            </div>

            {/* Friends Section */}
            <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-6 border border-[#fefefe]/5">
              <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-3">Friends ({friends.length})</label>
              {friends.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {friends.map(friend => (
                    <li key={friend.userId || friend.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[#fefefe]/5 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffbd59] to-[#ff907c] flex-shrink-0 overflow-hidden">
                        {friend.pfp ? (
                          <img src={friend.pfp} alt={friend.username} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-[#fefefe]">{getInitials(friend.username)}</span>
                        )}
                      </div>
                      <span className="font-medium text-[#fefefe]">{friend.username}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#fefefe]/40 text-sm italic">No friends yet. Add friends during chats!</p>
              )}
            </div>

            {/* Blocked Users Section */}
            <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-6 border border-[#fefefe]/5">
              <label className="block text-[#fefefe]/40 text-xs font-bold uppercase tracking-wider mb-3">Blocked Users ({blockedUsers.length})</label>
              {blockedUsers.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {blockedUsers.map(user => (
                    <li key={user.id} className="flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fefefe]/10 flex-shrink-0 overflow-hidden">
                          {user.pfp ? (
                            <img src={user.pfp} alt={user.username} className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-bold text-[#fefefe]/60">{getInitials(user.username)}</span>
                          )}
                        </div>
                        <span className="font-medium text-[#fefefe]">{user.username}</span>
                      </div>
                      <button
                        onClick={() => handleUnblock(user.id)}
                        className="px-3 py-1.5 text-xs font-medium text-[#fefefe]/60 bg-[#fefefe]/10 hover:bg-[#fefefe]/20 hover:text-[#fefefe] rounded-lg transition-colors"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#fefefe]/40 text-sm italic">No blocked users.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3.5 rounded-2xl bg-[#fefefe]/5 border border-[#fefefe]/10 text-[#fefefe]/60 font-medium hover:bg-[#fefefe]/10 hover:text-[#fefefe] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 transition-colors text-sm shadow-lg shadow-[#ffbd59]/20"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PFP Selection Modal */}
      {showPfpSelect && isEditing && (
        <PfpSelect 
          onClose={() => setShowPfpSelect(false)}
          onSave={handleImageSave}
          currentPfp={editedProfile.pfp}
          currentBg={editedProfile.pfp_background}
        />
      )}
    </div>
  );
}

export default ProfilePage;