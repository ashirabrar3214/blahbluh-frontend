import React, { useState, useEffect } from 'react';
import { api } from './api';

const UserIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const InboxIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>);

function HomePage({ socket, onChatStart, onProfileOpen, onInboxOpen, currentUsername, currentUserId }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUserId) {
        api.getFriendRequests(currentUserId).then(setFriendRequests).catch(console.error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (socket) {
      const onReq = () => api.getFriendRequests(currentUserId).then(setFriendRequests);
      const onAcc = (data) => {
         setNotifications(prev => [...prev, { id: Date.now(), message: 'Friend request accepted!' }]);
         onReq();
      };
      
      socket.on('friend-request-received', onReq);
      socket.on('friend-request-accepted', onAcc);
      return () => {
         socket.off('friend-request-received', onReq);
         socket.off('friend-request-accepted', onAcc);
      };
    }
  }, [socket, currentUserId]);

  const handleAcceptFriend = async (rid) => {
    await api.acceptFriendRequest(rid, currentUserId);
    api.getFriendRequests(currentUserId).then(setFriendRequests);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <nav className="fixed top-0 w-full z-10 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
        <span className="font-bold text-lg">blahbluh</span>
        <div className="flex items-center gap-3">
           <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              🔔 {(friendRequests.length + notifications.length) > 0 && <span className="bg-red-500 w-2 h-2 rounded-full absolute top-0 right-0"></span>}
           </button>
           {showNotifications && (
              <div className="absolute top-12 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-xl w-64 z-50">
                 {friendRequests.map(r => (
                    <div key={r.id} className="mb-2 text-sm">
                       <p>{r.from_user.username} sent request</p>
                       <button onClick={() => handleAcceptFriend(r.id)} className="text-blue-400 text-xs">Accept</button>
                    </div>
                 ))}
                 {notifications.map(n => <div key={n.id} className="text-sm text-green-400">{n.message}</div>)}
              </div>
           )}
           <button onClick={onInboxOpen} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"><InboxIcon /></button>
           <button onClick={onProfileOpen} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"><UserIcon /> {currentUsername}</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 text-center">Chat with anyone.</h1>
        <button onClick={onChatStart} className="bg-white text-black px-12 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform">Start Chatting</button>
      </div>
      <div className="py-6 text-center text-zinc-600 text-xs">© 2025 blahbluh</div>
    </div>
  );
}

export default HomePage;
