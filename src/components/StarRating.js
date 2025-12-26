import React from 'react';

const StarShape = () => (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
);

/**
 * A component to display a star rating, with support for partial stars.
 * @param {object} props - The component props.
 * @param {number} props.rating - The rating value (e.g., 3.5).
 * @param {number} [props.totalStars=5] - The total number of stars.
 * @param {string} [props.size='md'] - The size of the stars ('sm', 'md', 'lg').
 */
const StarRating = ({ rating, totalStars = 5, size = 'md' }) => {
  const percentage = (rating / totalStars) * 100;

  const sizeMap = {
    sm: '12px',
    md: '16px',
    lg: '20px',
  };

  return (
    <div className="relative inline-flex items-center" style={{ fontSize: sizeMap[size] || '16px' }}>
      {/* Background (empty) stars */}
      <div className="flex text-zinc-600">
        {[...Array(totalStars)].map((_, i) => (
          <svg key={i} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <StarShape />
          </svg>
        ))}
      </div>
      {/* Foreground (filled) stars */}
      <div className="absolute top-0 left-0 h-full overflow-hidden flex text-yellow-400" style={{ width: `${percentage}%` }}>
        {[...Array(totalStars)].map((_, i) => (
          <svg key={i} width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <StarShape />
          </svg>
        ))}
      </div>
    </div>
  );
};

export default StarRating;