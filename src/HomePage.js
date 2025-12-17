import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';

function AnimatedDots() {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span>{dots}</span>;
}

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
  </svg>
);

function HomePage({ onChatStart, onProfileOpen, onInboxOpen, currentUsername, currentUserId, unreadCount }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const requests = await api.getFriendRequests(currentUserId);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  }, [currentUserId]);

  const handleAcceptFriend = async (requestId) => {
    try {
      await api.acceptFriendRequest(requestId, currentUserId);
      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadFriendRequests();
      const interval = setInterval(() => loadFriendRequests(), 5000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, loadFriendRequests]);

  const joinQueue = async () => {
    try {
      if (!currentUserId) return;
      setInQueue(true);
      await api.joinQueue(currentUserId);
      setQueuePosition(0);
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  };

  const leaveQueue = async () => {
    try {
      await api.leaveQueue(currentUserId);
      setInQueue(false);
      setQueuePosition(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full z-10 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-lg shadow-lg shadow-white/10">
            B
          </div>
          <span className="font-bold text-lg tracking-tight text-white">blahbluh</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors relative"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                  {friendRequests.length}
                </span>
              )}
            </button>
            {showNotifications && friendRequests.length > 0 && (
              <div className="absolute top-10 right-0 w-80 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Friend Requests
                </h3>
                <div className="space-y-3 mb-4">
                  {friendRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                      <div>
                        <p className="text-white text-sm font-medium">{request.from_user.username} sent you a friend request</p>
                        <p className="text-gray-400 text-xs">Click accept to add them as a friend</p>
                      </div>
                      <button
                        onClick={() => handleAcceptFriend(request.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors shadow-lg"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onInboxOpen}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors relative"
          >
            <InboxIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onProfileOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            <UserIcon />
            {currentUsername || 'guest'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-lg w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">System Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            Chat with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              anyone.
            </span>
          </h1>
          
          <p className="text-lg text-zinc-400 mb-12 max-w-md mx-auto leading-relaxed">
            Instant anonymous connections. No login required. Just pure conversation.
          </p>

          {inQueue ? (
            <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-[32px] shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin"></div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">Finding a match<AnimatedDots /></h3>
                  <p className="text-zinc-500 text-sm">Position in queue: <span className="text-white font-mono">{queuePosition}</span></p>
                </div>
                <button
                  onClick={leaveQueue}
                  className="mt-4 px-6 py-3 rounded-full bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={joinQueue} 
              className="group relative w-full py-5 rounded-full bg-white text-black text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Chatting
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="py-6 text-center text-zinc-600 text-xs font-medium">
        &copy; 2025 blahbluh. Crafted for anonymity.
      </div>
    </div>
  );
}

export default HomePage;
