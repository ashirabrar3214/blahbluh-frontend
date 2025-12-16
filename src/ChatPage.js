import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api';
import ProfileModal from './components/ProfileModal';
import ReviewPopup from './ReviewPopup';

// --- SVGs ---
const SendIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const NextIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>);
const UserPlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>);
const BlockIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const ReplyIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>);
const SwipeUpIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>);

function AnimatedDots() {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev === '...' ? '.' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}

function ChatPage({ socket, targetFriend, initialChatData, user, currentUserId, currentUsername, onGoHome, onInboxOpen }) {
  
  // --- STATE ---
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  
  // Helper to find partner
  const getPartner = useCallback((data) => {
    return data?.users?.find(u => (u.id || u.userId) !== currentUserId);
  }, [currentUserId]);

  // Init ID from props
  const [chatId, setChatId] = useState(
    targetFriend ? targetFriend.chatId : (initialChatData?.chatId || null)
  );
  
  // Init Partner from props
  const [chatPartner, setChatPartner] = useState(
    targetFriend 
      ? { userId: targetFriend.userId, username: targetFriend.username } 
      : getPartner(initialChatData)
  );

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [partnerToReview, setPartnerToReview] = useState(null);

  // Refs
  const inQueueRef = useRef(false); 
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  
  // --- INITIALIZATION (Friend vs Random) ---

  // 1. Friend Mode
  useEffect(() => {
    if (targetFriend && socket) {
      setChatPartner({ userId: targetFriend.userId, username: targetFriend.username });
      setChatId(targetFriend.chatId);
      socket.emit('join-chat', { chatId: targetFriend.chatId });
      setInQueue(false);
    }
  }, [targetFriend, socket]);

  // 2. Random Mode
  useEffect(() => {
    if (initialChatData && socket && !targetFriend) {
      const partner = getPartner(initialChatData);
      setChatPartner(partner);
      setChatId(initialChatData.chatId);
      socket.emit('join-chat', { chatId: initialChatData.chatId });
      setInQueue(false);
    }
  }, [initialChatData, socket, targetFriend, getPartner]);

  // --- SOCKET LISTENERS ---
  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const requests = await api.getFriendRequests(currentUserId);
      setFriendRequests(requests);
    } catch (error) { console.error(error); }
  }, [currentUserId]);

  useEffect(() => {
    if (!socket) return;

    socket.off('new-message');
    socket.off('partner-disconnected');
    socket.off('friend-request-received');
    socket.off('friend-request-accepted');

    const onNewMessage = (msg) => {
      setMessages(prev => [...prev, { ...msg, reactions: msg.reactions || {} }]);
    };
    
    const onPartnerDisconnect = () => {
        if (chatPartner) {
          setPartnerToReview(chatPartner);
          setShowReviewPopup(true);
        }
        setNotification('partner-disconnected');
        setChatId(null);
        setChatPartner(null);
        setMessages([]);
        setInQueue(false);
        setQueuePosition(0);
    };

    socket.on('new-message', onNewMessage);
    socket.on('partner-disconnected', onPartnerDisconnect);
    socket.on('friend-request-received', () => loadFriendRequests());
    socket.on('friend-request-accepted', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'friend-accepted',
        message: data.message || 'Friend request accepted!',
        timestamp: new Date().toISOString()
      }]);
      loadFriendRequests();
    });

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('partner-disconnected', onPartnerDisconnect);
      socket.off('friend-request-received');
      socket.off('friend-request-accepted');
    };
  }, [socket, chatPartner, loadFriendRequests]);

  // --- WATCHDOG ---
  useEffect(() => {
    inQueueRef.current = inQueue;
    if (inQueue && queuePosition === 0) {
      const timer = setTimeout(() => {
        if (socket?.connected && inQueueRef.current) {
           api.joinQueue(currentUserId).catch(console.error);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [inQueue, queuePosition, socket, currentUserId]);

  // --- ACTIONS ---

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUserId) return;
    
    if (!socket?.connected) {
        setActionToast('Reconnecting...');
        socket?.connect();
        return;
    }

    const messageData = {
      chatId,
      message: newMessage.trim(),
      userId: currentUserId,
      username: currentUsername,
      replyTo: replyingTo
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
    setReplyingTo(null);
  };

  const joinQueue = async () => {
    try {
      if (!socket?.connected) socket?.connect();
      setInQueue(true);
      const result = await api.joinQueue(currentUserId);
      setQueuePosition(result.queuePosition || 0);
    } catch (e) { console.error(e); }
  };

  const leaveQueue = async () => {
     try {
       await api.leaveQueue(currentUserId);
       setInQueue(false);
     } catch (e) { console.error(e); }
  };

  const confirmLeaveChat = () => {
    setShowWarning(false);
    if (targetFriend) {
       onGoHome();
    } else {
       if (chatPartner) {
          setPartnerToReview(chatPartner);
          setShowReviewPopup(true);
       } else {
          finishLeavingChat();
       }
    }
  };

  const finishLeavingChat = () => {
    if (chatId && socket) {
      socket.emit('leave-chat', { chatId, userId: currentUserId });
    }
    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    setPartnerToReview(null);
    joinQueue();
  };

  const handleReaction = (messageId, emoji) => {
     socket?.emit('add-reaction', { chatId, messageId, emoji, userId: currentUserId });
     setShowActions(null);
  };

  const handleReply = (msg) => { 
    setReplyingTo(msg); 
    setShowActions(null); 
    inputRef.current?.focus(); 
  };

  const handleSwipeStart = (e) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const handleSwipeEnd = (e) => {
    if (!swipeStartX.current) return;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (dy < -100) setShowWarning(true);
  };

  const handleAddFriend = async () => {
    if (chatPartner && currentUserId) {
        try {
            await api.sendFriendRequest(currentUserId, chatPartner.userId || chatPartner.id);
            setActionToast('Request sent');
        } catch(e) { setActionToast('Failed to send'); }
    }
  };

  const handleAcceptFriend = async (rid) => {
    await api.acceptFriendRequest(rid, currentUserId);
    loadFriendRequests();
  };
  
  const handleBlockUser = async () => {
      if(chatPartner) {
          await api.blockUser(currentUserId, chatPartner.userId || chatPartner.id);
          setActionToast('Blocked');
      }
  };
  
  const handleReviewSubmit = () => {
      setShowReviewPopup(false);
      finishLeavingChat();
  };

  const handleNextUser = () => setShowWarning(true);

  // --- RENDER ---
  if (chatId && chatPartner) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col font-sans h-[100dvh]">
        <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{chatPartner?.username?.[0]?.toUpperCase()}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100">{chatPartner?.username}</span>
                <span className="text-[10px] text-green-500">Online</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onGoHome} className="text-xs text-zinc-400">Home</button>
            <button onClick={onInboxOpen} className="text-xs text-zinc-400">Inbox</button>
            <button onClick={handleAddFriend} className="text-zinc-400"><UserPlusIcon/></button>
            <button onClick={handleBlockUser} className="text-zinc-400"><BlockIcon/></button>
            <button onClick={handleNextUser} className="flex items-center gap-1 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Next <NextIcon/></button>
          </div>
        </header>

        <div className="md:hidden absolute top-20 left-0 right-0 z-10 flex justify-center pointer-events-none opacity-60">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-[10px] text-zinc-400">
                <SwipeUpIcon />
                <span>Swipe up to skip</span>
             </div>
        </div>

        <div 
           ref={messagesContainerRef}
           className="flex-1 overflow-y-auto px-4 pt-24 pb-4 space-y-3"
           onTouchStart={handleSwipeStart} 
           onTouchEnd={handleSwipeEnd}
        >
          {messages.map((msg, i) => {
            const isOwn = msg.userId === currentUserId;
            return (
              <div key={i} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                 <div 
                    onClick={() => setShowActions(msg.id === showActions ? null : msg.id)}
                    className={`relative px-4 py-2 rounded-xl max-w-[70%] ${isOwn ? 'bg-blue-600' : 'bg-zinc-800'}`}
                 >
                    {msg.replyTo && <div className="text-xs opacity-50 border-l pl-2 mb-1">{msg.replyTo.message}</div>}
                    <div>{msg.message}</div>
                    
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <span key={emoji} className="text-xs bg-black/20 px-1 rounded">{emoji} {users.length}</span>
                            ))}
                        </div>
                    )}
                    
                    {showActions === msg.id && (
                        <div className="absolute -top-8 left-0 bg-zinc-900 border border-zinc-700 p-1 rounded-full flex gap-2 z-10">
                            {['❤️','😂','👍'].map(e => (
                                <button key={e} onClick={(ev) => { ev.stopPropagation(); handleReaction(msg.id, e); }}>{e}</button>
                            ))}
                            <button onClick={(ev) => { ev.stopPropagation(); handleReply(msg); }}><ReplyIcon/></button>
                        </div>
                    )}
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-black">
          {replyingTo && <div className="text-xs text-zinc-400 mb-2">Replying to {replyingTo.username} <button onClick={()=>setReplyingTo(null)}>x</button></div>}
          <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
            <input 
              ref={inputRef}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-zinc-900 rounded-full px-4 py-3"
              placeholder="Message..."
            />
            <button type="submit" className="bg-blue-600 p-3 rounded-full"><SendIcon /></button>
          </form>
        </div>

        {showWarning && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
             <div className="bg-zinc-900 p-6 rounded-xl">
               <h3>Skip Chat?</h3>
               <div className="flex gap-2 mt-4">
                 <button onClick={() => setShowWarning(false)} className="flex-1 bg-zinc-800 py-2 rounded">Cancel</button>
                 <button onClick={confirmLeaveChat} className="flex-1 bg-white text-black py-2 rounded">Yes</button>
               </div>
             </div>
          </div>
        )}
        {showReviewPopup && partnerToReview && (
           <ReviewPopup partner={partnerToReview} onClose={() => setShowReviewPopup(false)} onSubmit={handleReviewSubmit} />
        )}
        {actionToast && <div className="fixed top-24 left-0 right-0 text-center pointer-events-none"><span className="bg-zinc-800 px-4 py-2 rounded-full text-sm">{actionToast}</span></div>}
      </div>
    );
  }

  // Queue Screen
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
       <nav className="fixed top-0 w-full z-10 px-6 py-4 flex justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
          <span className="font-bold text-lg">blahbluh</span>
          <div className="flex gap-2">
             <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <div className="bg-zinc-800 p-2 rounded-full">🔔</div>
                {(friendRequests.length > 0 || notifications.length > 0) && <span className="absolute top-0 right-0 bg-red-500 w-3 h-3 rounded-full"></span>}
             </button>
             {showNotifications && (
               <div className="absolute top-12 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-xl w-64 z-50">
                  {friendRequests.map(r => (
                    <div key={r.id} className="mb-2 text-sm">
                      <p>{r.from_user.username} sent request</p>
                      <button onClick={() => handleAcceptFriend(r.id)} className="text-blue-400 text-xs">Accept</button>
                    </div>
                  ))}
               </div>
             )}
             <button onClick={onInboxOpen} className="bg-zinc-800 p-2 rounded-full">📥</button>
             <button onClick={() => setShowProfile(true)} className="bg-zinc-800 px-3 py-2 rounded-full text-xs">{currentUsername}</button>
          </div>
       </nav>

       <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold mb-6 text-center">Chat with anyone.</h1>
          {inQueue ? (
             <div className="bg-zinc-900 p-8 rounded-3xl text-center">
                <h3 className="text-xl mb-2">Finding match<AnimatedDots/></h3>
                {notification === 'partner-disconnected' && <p className="text-orange-400 text-sm mb-2">Partner disconnected</p>}
                <button onClick={leaveQueue} className="bg-zinc-800 px-6 py-2 rounded-full mt-4">Cancel</button>
             </div>
          ) : (
             <button onClick={joinQueue} className="bg-white text-black px-12 py-4 rounded-full text-lg font-bold">Start Chatting</button>
          )}
       </div>
       {showProfile && user && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
       {actionToast && <div className="fixed top-24 left-0 right-0 text-center pointer-events-none"><span className="bg-zinc-800 px-4 py-2 rounded-full text-sm">{actionToast}</span></div>}
    </div>
  );
}

export default ChatPage;