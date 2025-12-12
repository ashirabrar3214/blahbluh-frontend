import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { api } from './api';

// Animated dots component
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

function HomePage({ onChatStart, onProfileOpen, currentUsername, currentUserId, notification: externalNotification, onNotificationChange }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [notification, setNotification] = useState(externalNotification || null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (externalNotification) {
      setNotification(externalNotification);
    }
  }, [externalNotification]);

  useEffect(() => {
    socketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current.on('connect', () => {
      if (currentUserId) {
        socketRef.current.emit('register-user', { userId: currentUserId });
      }
    });

    socketRef.current.on('chat-paired', (data) => {
      const partner = data.users.find(u => u.userId !== currentUserId);
      if (partner) {
        setInQueue(false);
        setNotification(null);
        onChatStart(data.chatId, partner, socketRef.current);
      }
    });

    socketRef.current.on('partner-disconnected', () => {
      setNotification('partner-disconnected');
      setInQueue(false);
    });

    return () => socketRef.current?.disconnect();
  }, [currentUserId, onChatStart]);

  const joinQueue = async () => {
    try {
      if (!socketRef.current?.connected || !currentUserId) return;
      const result = await api.joinQueue(currentUserId);
      setInQueue(true);
      setQueuePosition(result.queuePosition ?? 0);
      setNotification(null);
      if (onNotificationChange) onNotificationChange(null);
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
            <span className={`w-2 h-2 rounded-full ${socketRef.current?.connected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></span>
            <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              {socketRef.current?.connected ? 'System Online' : 'Connecting...'}
            </span>
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
            <div className="flex flex-col gap-4">
              {notification === 'partner-disconnected' && (
                <div className="px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm mb-2">
                  Partner disconnected. ready to go again?
                </div>
              )}
              
              <button 
                onClick={joinQueue} 
                className="group relative w-full py-5 rounded-full bg-white text-black text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Start Chatting
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </button>
            </div>
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