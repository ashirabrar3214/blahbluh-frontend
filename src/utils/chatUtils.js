export const makeFriendChatId = (a, b) =>
  `friend_${[a, b].sort().join('_')}`;