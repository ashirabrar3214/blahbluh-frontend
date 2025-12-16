import React, { useState, useEffect } from 'react';
import { api } from './api';
import { makeFriendChatId } from './utils/chatUtils';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

function InboxPage({ currentUserId, onBack, onChatOpen }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUserId) return;
      try {
        const friendsData = await api.getFriends(currentUserId);
        setFriends(friendsData);
      } catch (error) {
        console.error('Error loading friends:', error);
        setFriends([]);
      }
    };
    loadFriends();
  }, [currentUserId]);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
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
        
        <h1 className="text-lg font-bold text-white">Inbox</h1>
        
        <div className="w-16"></div> {/* Spacer for centering */}
      </header>

      {/* Inbox Content */}
      <div className="flex-1">
        {friends.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <MessageIcon />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No friends yet</h2>
            <p className="text-zinc-400 text-center max-w-sm">
              Add friends during chats to start private conversations with them here.
            </p>
          </div>
        ) : (
          <div className="px-4 py-2">
            {friends.map((friend) => (
              <div
                key={friend.userId}
                onClick={() => {
                  const chatId = makeFriendChatId(currentUserId, friend.userId);
                  onChatOpen && onChatOpen({ ...friend, chatId });
                }}
                className="flex items-center gap-3 p-4 hover:bg-zinc-900/50 rounded-2xl cursor-pointer transition-colors border-b border-zinc-800/50 last:border-b-0"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {getInitials(friend.username)}
                  </span>
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {friend.username}
                    </h3>
                    <span className="text-xs text-zinc-500 flex-shrink-0">
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    Start a conversation
                  </p>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxPage;