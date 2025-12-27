import React, { useState, useEffect } from 'react';
import { api } from './api';

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

function InboxPage({ currentUserId, currentUsername, onBack, onChatOpen, socket }) {
  const [friends, setFriends] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [pfpUrl, setPfpUrl] = useState(null);

  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUserId) return;
      try {
        const friendsData = await api.getFriends(currentUserId);
        console.log('👥 InboxPage: Loaded friends data:', friendsData);
        setFriends(friendsData);
        // Load unread counts for each friend
        const counts = {};
        for (const friend of friendsData) {
          const friendId = friend.userId || friend.id;
          try {
            const count = await api.getUnreadCount(currentUserId, friendId);
            console.log(`📊 InboxPage: Unread count for ${friend.username} (${friendId}):`, count);
            counts[friendId] = count;
          } catch (error) {
            console.error(`❌ InboxPage: Error getting unread count for ${friend.username}:`, error);
            counts[friendId] = 0;
          }
        }
        console.log('📊 InboxPage: Final unread counts:', counts);
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error in loading friends:', error);
        setFriends([]);
      }
    };
    loadFriends();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    let ignore = false;
    const loadPfp = async () => {
      try {
        const pfpData = await api.getUserPfp(currentUserId);
        if (!ignore && pfpData) {
          const url = pfpData.pfp || pfpData.pfpLink;
          if (url) setPfpUrl(url);
        }
      } catch (error) {
        console.error('Error loading user PFP:', error);
      }
    };
    loadPfp();
    return () => { ignore = true; };
  }, [currentUserId]);

  // Listen for new messages to update unread counts
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ InboxPage: No socket available');
      return;
    }

    console.log('🔌 InboxPage: Setting up socket listener for friend-message-received');

    const handleFriendMessage = (messageData) => {
      console.log('📨 InboxPage: Friend message received:', messageData);
      const senderId = messageData.userId || messageData.senderId;
      if (senderId && senderId !== currentUserId) {
        console.log(`📊 InboxPage: Incrementing unread count for sender ${senderId}`);
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    };

    socket.on('friend-message-received', handleFriendMessage);
    console.log('✅ InboxPage: Socket listener attached');
    
    return () => {
      console.log('🔌 InboxPage: Removing socket listener');
      socket.off('friend-message-received', handleFriendMessage);
    };
  }, [socket, currentUserId]);

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
          <span className="text-sm font-medium">blahbluh</span>
        </button>
        
        <h1 className="text-lg font-bold text-white">Inbox</h1>
        
        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
          {pfpUrl ? (
            <img src={pfpUrl} alt="Profile" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs font-bold text-zinc-400">
              {getInitials(currentUsername)}
            </span>
          )}
        </div>
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
            {friends.map((friend, index) => (
              <div
                key={friend.userId || friend.id || index}
                onClick={() => {
                  const friendId = friend.userId || friend.id;
                  const chatId = `friend_${[currentUserId, friendId].sort().join('_')}`;
                  console.log('🔍 InboxPage: Opening chat with friend:', { friend, friendId, chatId });
                  onChatOpen && onChatOpen({ ...friend, userId: friendId, chatId });
                }}
                className="flex items-center gap-3 p-4 hover:bg-zinc-900/50 rounded-2xl cursor-pointer transition-colors border-b border-zinc-800/50 last:border-b-0"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {friend.pfp ? (
                    <img src={friend.pfp} alt={`${friend.username}'s avatar`} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {getInitials(friend.username)}
                    </span>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {friend.username}
                    </h3>
                    {unreadCounts[friend.userId || friend.id] > 0 && (
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {unreadCounts[friend.userId || friend.id] > 9 ? '9+' : unreadCounts[friend.userId || friend.id]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    {unreadCounts[friend.userId || friend.id] > 0 
                      ? `${unreadCounts[friend.userId || friend.id]} unread message${unreadCounts[friend.userId || friend.id] > 1 ? 's' : ''}` 
                      : 'Start a conversation'
                    }
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