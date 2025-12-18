// Utility functions for normalizing user data structures

export const normalizeUser = (user) => {
  if (!user) return null;
  
  return {
    id: user.id || user.userId,
    username: user.username,
    ...user
  };
};

export const normalizeFriend = (friend) => {
  if (!friend) return null;
  
  return {
    id: friend.id || friend.userId,
    userId: friend.id || friend.userId, // Keep both for backward compatibility
    username: friend.username,
    ...friend
  };
};

export const getUserId = (user) => {
  return user?.id || user?.userId;
};