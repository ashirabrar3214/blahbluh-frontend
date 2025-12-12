import React, { useState } from 'react';

const StarIcon = ({ filled, onClick }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`cursor-pointer transition-all duration-200 ${filled ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`}
    onClick={onClick}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

const FlagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

function ReviewPopup({ partner, currentUserId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (action) => {
    // Save review if rating is provided
    if (rating > 0) {
      const existingReviews = JSON.parse(localStorage.getItem(`reviews_${partner.userId}`) || '[]');
      const newReview = {
        rating,
        fromUser: 'Anonymous',
        timestamp: Date.now()
      };
      existingReviews.push(newReview);
      localStorage.setItem(`reviews_${partner.userId}`, JSON.stringify(existingReviews));
    }
    
    if (action === 'friend') {
      // Save friend to localStorage
      if (currentUserId) {
        const existingFriends = JSON.parse(localStorage.getItem(`friends_${currentUserId}`) || '[]');
        const newFriend = {
          userId: partner.userId,
          username: partner.username,
          addedAt: Date.now(),
          lastMessage: null,
          unreadCount: 0
        };
        
        // Check if friend already exists
        const friendExists = existingFriends.some(f => f.userId === partner.userId);
        if (!friendExists) {
          existingFriends.push(newFriend);
          localStorage.setItem(`friends_${currentUserId}`, JSON.stringify(existingFriends));
        }
      }
    }
    
    onSubmit({ rating, action });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">
              {partner?.username?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Rate your chat</h3>
          <p className="text-zinc-400 text-sm">How was your conversation with {partner?.username || 'this person'}?</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= (hoveredRating || rating)}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => handleSubmit('friend')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            <UserPlusIcon />
            Add Friend
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('block')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-red-900/30 hover:text-red-400 transition-colors"
            >
              <BlockIcon />
              Block
            </button>
            
            <button
              onClick={() => handleSubmit('report')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-orange-900/30 hover:text-orange-400 transition-colors"
            >
              <FlagIcon />
              Report
            </button>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => handleSubmit('skip')}
          className="w-full py-3 rounded-2xl bg-transparent text-zinc-500 font-medium text-sm hover:text-zinc-300 transition-colors"
        >
          Skip Review
        </button>
      </div>
    </div>
  );
}

export default ReviewPopup;