import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import ReviewPopup from './ReviewPopup';

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
);
const UserPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>
);
const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
);

function ChatPage({ socket, user, currentUserId: propUserId, currentUsername: propUsername, initialChatData, targetFriend, onGoHome, onInboxOpen, unreadCount }) {
  const [inQueue, setInQueue] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [partnerToReview, setPartnerToReview] = useState(null);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (propUserId && propUsername) {
      setCurrentUserId(propUserId);
      setCurrentUsername(propUsername);
    }
  }, [propUserId, propUsername]);

  useEffect(() => {
    const checkFriendship = async () => {
      if (!currentUserId || !chatPartner) return;
      try {
        const friends = await api.getFriends(currentUserId);
        const partnerId = chatPartner.id || chatPartner.userId;
        const isFriend = friends.some(friend => (friend.id || friend.userId) === partnerId);
        setIsAlreadyFriend(isFriend);
      } catch (error) { console.error(error); }
    };
    checkFriendship();
  }, [currentUserId, chatPartner]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (msg) => {
      if (chatId && (msg.chatId === chatId)) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, reactions: msg.reactions || {} }];
        });
      }
    };

    const handlePartnerDisconnected = () => {
      setActionToast("Partner left. Searching...");
      setChatId(null);
      setChatPartner(null);
      setMessages([]);
      joinQueue();
    };

    socket.on('new-message', handleNewMessage);
    socket.on('friend-message-received', handleNewMessage);
    socket.on('partner-disconnected', handlePartnerDisconnected);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('friend-message-received', handleNewMessage);
      socket.off('partner-disconnected', handlePartnerDisconnected);
    };
  }, [socket, currentUserId, chatId]);

  useEffect(() => {
    if (initialChatData) {
      const myId = currentUserId;
      const partner = initialChatData.users.find(u => (u.id || u.userId) !== myId);
      if (partner) {
        setChatId(initialChatData.chatId);
        setChatPartner(partner);
        setMessages([]);
        socket?.emit('join-chat', { chatId: initialChatData.chatId });
      }
    } else if (targetFriend && currentUserId) {
      const partner = targetFriend;
      const chatId = `friend_${[currentUserId, (partner.userId || partner.id)].sort().join('_')}`;
      
      setChatId(chatId);
      setChatPartner(partner);
      socket?.emit('join-chat', { chatId });
      
      api.getFriendChatMessages(chatId)
        .then(history => {
          setMessages(history.map(msg => ({
            id: msg.id,
            chatId: msg.chat_id,
            message: msg.message,
            userId: msg.sender_id,
            username: msg.sender_id === currentUserId ? currentUsername : partner.username,
            timestamp: msg.created_at,
            reactions: {}
          })));
        })
        .catch(console.error);
        
      api.markMessagesAsRead(currentUserId, (partner.userId || partner.id)).catch(console.error);
    }
  }, [initialChatData, targetFriend, currentUserId, currentUsername, socket]);

  const joinQueue = async () => {
    try {
      setInQueue(true);
      await api.joinQueue(currentUserId);
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatId) return;
    const msg = {
      id: Date.now(),
      chatId,
      message: newMessage.trim(),
      userId: currentUserId,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      reactions: {}
    };
    
    if (!chatId.startsWith('friend_')) {
      setMessages(prev => [...prev, msg]);
    }
    
    socket.emit('send-message', msg);
    setNewMessage('');
  };

  const handleNextUser = () => setShowWarning(true);
  const confirmLeaveChat = () => {
    setShowWarning(false);
    if (chatPartner && !chatId.startsWith('friend_')) {
      setPartnerToReview(chatPartner);
      setShowReviewPopup(true);
    } else {
      onGoHome();
    }
  };

  const handleReviewSubmit = () => {
    setShowReviewPopup(false);
    setPartnerToReview(null);
    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    joinQueue();
  };

  const handleAddFriend = async () => {
    if (!chatPartner || !currentUserId) return;
    const partnerId = chatPartner.id || chatPartner.userId;
    if (partnerId === currentUserId) {
      setActionToast('Cannot add yourself as friend');
      return;
    }
    
    try {
      setRequestSent(true);
      await api.sendFriendRequest(currentUserId, partnerId);
      setActionToast('Friend request sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setActionToast('Failed to send request');
      setRequestSent(false);
    }
  };

  if (!chatId || !chatPartner) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-2 border-t-blue-500 border-zinc-800 rounded-full animate-spin"></div>
          <p>Connecting...</p>
          <button onClick={onGoHome} className="text-sm text-zinc-500 hover:text-white">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans h-[100dvh]">
      <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-white tracking-wide">{chatPartner?.username?.[0]?.toUpperCase() || '?'}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-100 leading-tight">{chatPartner?.username || 'Stranger'}</span>
              <span className="text-[10px] font-medium text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Online</span>
           </div>
        </div>

        <div className="flex items-center gap-2">
          {chatId?.startsWith('friend_') ? (
            <>
              <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">B</div>
                <span className="text-xs font-medium">blahbluh</span>
              </button>
              
              <button onClick={onInboxOpen} className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 relative mr-2">
                Inbox
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
                )}
              </button>

              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
                <BlockIcon />
              </button>
            </>
          ) : (
            <>
              <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 mr-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">B</div>
                <span className="text-xs font-medium">blahbluh</span>
              </button>
              <button onClick={onInboxOpen} className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 relative">
                Inbox
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
                )}
              </button>
              {isAlreadyFriend ? (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-800 text-green-400">
                  <CheckIcon />
                </div>
              ) : requestSent ? (
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-800 text-yellow-400 text-xs font-bold">
                  ⏳
                </div>
              ) : (
                <button onClick={handleAddFriend} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all active:scale-95">
                  <UserPlusIcon />
                </button>
              )}
              <button onClick={handleNextUser} className="hidden md:flex ml-2 pl-4 pr-5 py-2 rounded-full bg-white text-black font-bold text-xs items-center gap-1.5 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                <span>Next</span>
                <NextIcon />
              </button>
            </>
          )}
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 pt-24 pb-4 space-y-3">
        {messages.map((msg, index) => {
          const isOwn = msg.userId === currentUserId;
          return (
            <div key={msg.id || index} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-[80%] sm:max-w-[70%] px-4 py-2.5 shadow-sm transition-all duration-200 cursor-default ${isOwn ? 'bg-blue-600 text-white rounded-[20px] rounded-br-sm' : 'bg-zinc-800 text-gray-100 rounded-[20px] rounded-bl-sm'}`}>
                <div className="text-[15px] leading-relaxed break-words font-normal">{msg.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent shrink-0 z-30">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-end gap-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-1.5 rounded-[28px] shadow-2xl">
            <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type something fun..." className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 px-4 py-3 focus:ring-0 text-[16px]" autoComplete="off" />
            <button type="submit" disabled={!newMessage.trim()} className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${newMessage.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-0' : 'bg-zinc-800 text-zinc-600 rotate-90 cursor-default'}`}>
              <SendIcon />
            </button>
          </form>
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl scale-100">
            <h3 className="text-lg font-bold text-white text-center mb-2">Skip Chat?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowWarning(false)} className="flex-1 py-3.5 rounded-2xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={confirmLeaveChat} className="flex-1 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">Yes, Skip</button>
            </div>
          </div>
        </div>
      )}

      {actionToast && (
        <div className="fixed top-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium text-white shadow-xl animate-in slide-in-from-top-4 fade-in">{actionToast}</div>
        </div>
      )}

      {showReviewPopup && partnerToReview && (
        <ReviewPopup partner={partnerToReview} onClose={handleReviewSubmit} onSubmit={handleReviewSubmit} />
      )}
    </div>
  );
}

export default ChatPage;
