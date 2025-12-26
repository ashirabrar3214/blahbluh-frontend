import React from "react";

const Star = ({ fill }) => {
  const id = React.useId();

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill={`url(#${id})`}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fill * 100}%`} stopColor="#facc15" />
          <stop offset={`${fill * 100}%`} stopColor="#52525b" />
        </linearGradient>
      </defs>

      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

const StarRating = ({ rating, totalStars = 5 }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalStars }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return <Star key={i} fill={fill} />;
      })}
    </div>
  );
};

export default StarRating;
