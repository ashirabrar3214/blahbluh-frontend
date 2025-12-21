import React, { useState, useEffect } from 'react';

/* ---------- Icons ---------- */

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`cursor-pointer transition-all duration-200 ${
      filled
        ? 'text-yellow-400'
        : 'text-zinc-400 hover:text-yellow-400'
    }`}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const BlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const FlagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

/* ---------- Component ---------- */

function ReviewPopup({ partner, initialRating = 0, onClose, onSubmit }) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);


  const submitRatingOnly = () => {
    if (rating <= 0) return;
    onSubmit({ rating, action: 'rate' });
    onClose();
  };

  const submitWithAction = (action) => {
    onSubmit({ rating, action });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white text-black shadow-xl px-6 py-7">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-zinc-200 flex items-center justify-center text-lg font-semibold text-zinc-700">
            {partner?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <h3 className="text-lg font-semibold">Rate your chat</h3>
          <p className="text-sm text-zinc-500 mt-1">
            How was your conversation with {partner?.username || 'this person'}?
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
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

        {initialRating > 0 && (
          <p className="text-xs text-zinc-400 text-center mt-2">
            You previously rated this {initialRating}★
          </p>
        )}

        {/* Submit rating */}
        <button
          disabled={rating === 0}
          onClick={submitRatingOnly}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
            rating === 0
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-zinc-800'
          }`}
        >
          Submit Rating
        </button>

        {/* Actions */}
        <div className="mt-5 space-y-3">
          <button
            onClick={() => submitWithAction('friend')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-sm font-medium"
          >
            <UserPlusIcon />
            Add Friend
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => submitWithAction('block')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 hover:bg-red-100 text-sm"
            >
              <BlockIcon />
              Block
            </button>

            <button
              onClick={() => submitWithAction('report')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 hover:bg-orange-100 text-sm"
            >
              <FlagIcon />
              Report
            </button>
          </div>
        </div>

        {/* Skip */}
        <button
          onClick={() => submitWithAction('skip')}
          className="mt-4 w-full text-sm text-zinc-400 hover:text-zinc-600"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default ReviewPopup;
