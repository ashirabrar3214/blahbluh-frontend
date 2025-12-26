import React, { useEffect, useState } from 'react';
import StarRating from './components/StarRating';

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? '#fbbf24' : 'none'}
    stroke="#fbbf24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: 'pointer' }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function ReviewPopup({
  partner,
  partnerRating,
  initialRating = 0,
  onSubmit, // must be async-safe
  onClose // just closes UI
}) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const run = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // IMPORTANT: wait for parent to finish (save review, etc)
      await Promise.resolve(onSubmit?.(payload));
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[92%] max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner flex-shrink-0">
              <span className="text-lg font-bold text-white tracking-wide">
                {getInitials(partner?.username)}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Rate {partner?.username || 'Stranger'}</h2>
              {partnerRating && partnerRating.reviewCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={partnerRating.averageRating} size="md" />
                  <span className="text-xs text-zinc-400">
                    ({partnerRating.reviewCount} reviews)
                  </span>
                </div>
              )}
              <p className="text-xs text-zinc-400 mt-1">Rate your chat partner to help us improve the community.</p>
            </div>
          </div>

          <button
            onClick={() => onClose?.()}
            className="text-zinc-400 hover:text-white"
            disabled={submitting}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={hovered ? star <= hovered : star <= rating}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            disabled={submitting || rating <= 0}
            onClick={() => run({ rating, action: 'rate' })}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-300 px-4 py-2 text-sm font-semibold"
          >
            {submitting ? 'Submitting…' : 'Submit Rating'}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={submitting}
              onClick={() => run({ rating, action: 'friend' })}
              className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold"
            >
              Add Friend
            </button>
            <button
              disabled={submitting}
              onClick={() => run({ rating, action: 'block' })}
              className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold"
            >
              Block
            </button>
            <button
              disabled={submitting}
              onClick={() => run({ rating, action: 'report' })}
              className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs font-semibold"
            >
              Report
            </button>
          </div>

          <button
            disabled={submitting}
            onClick={() => run({ rating: 0, action: 'skip' })}
            className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200"
          >
            Skip (no rating)
          </button>
        </div>
      </div>
    </div>
  );
}
