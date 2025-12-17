import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api';
import ProfileModal from './components/ProfileModal';
import ReviewPopup from './ReviewPopup';

// --- SVGs ---
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
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
);
const SwipeUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
);

// Animated dots component
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

function ChatPage({ socket, user, currentUserId: propUserId, currentUsername: propUsername, initialChatData, targetFriend, onGoHome, onInboxOpen, globalNotifications, globalFriendRequests, setGlobalNotifications, setGlobalFriendRequests, unreadCount }) {
  // --- STATE ---
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  // Use global state instead of local state
  const friendRequests = globalFriendRequests;
  const notifications = globalNotifications;
  const setFriendRequests = setGlobalFriendRequests;
  const setNotifications = setGlobalNotifications;
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug logging for notification counts
  useEffect(() => {
    console.log('NOTIFICATION DEBUG: ChatPage notification counts - friendRequests:', friendRequests.length, 'notifications:', notifications.length, 'total:', friendRequests.length + notifications.length);
  }, [friendRequests.length, notifications.length]);
  const [showWarning, setShowWarning] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [partnerToReview, setPartnerToReview] = useState(null);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);

  // --- REFS ---
  const currentUserIdRef = useRef(null);
  const inQueueRef = useRef(false); 
  const queueWatchdogRef = useRef(null);
  
  const longPressTimer = useRef(null);
  const hoverTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // --- FUNCTIONS ---
  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const requests = await api.getFriendRequests(currentUserId);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const checkFriendshipStatus = useCallback(async () => {
    if (!currentUserId || !chatPartner) return;
    try {
      const friends = await api.getFriends(currentUserId);
      const partnerId = chatPartner.id || chatPartner.userId;
      const isFriend = friends.some(friend => (friend.id || friend.userId) === partnerId);
      setIsAlreadyFriend(isFriend);
    } catch (error) {
      console.error('Error checking friendship status:', error);
      setIsAlreadyFriend(false);
    }
  }, [currentUserId, chatPartner]);

  const joinQueue = useCallback(async () => {
    try {
      if (!socket?.connected) {
        console.log('🔌 Socket disconnected, cannot join queue');
        setActionToast("Connection lost");
        return;
      }
      
      const userId = currentUserId;
      if (!userId) return;

      console.log('🚀 Joining Queue...');
      setInQueue(true); 
      
      const result = await api.joinQueue(userId);
      console.log('✅ Joined Queue:', result);
      setQueuePosition(result.queuePosition ?? 0);
      
    } catch (error) {
      console.error('Error joining queue:', error);
      setInQueue(false);
      setActionToast("Could not join queue");
    }
  }, [currentUserId, socket]);

  // --- EFFECT HOOKS ---

  // Set initial state from props
  useEffect(() => {
    if (propUserId && propUsername) {
      setCurrentUserId(propUserId);
      setCurrentUsername(propUsername);
      setCurrentUser(user);
    }
  }, [propUserId, propUsername, user]);

  // Load friend requests when user ID is set
  useEffect(() => {
    if (currentUserId) {
      loadFriendRequests();
    }
  }, [currentUserId, loadFriendRequests]);

  // Check friendship status when chat partner changes
  useEffect(() => {
    if (currentUserId && chatPartner) {
      checkFriendshipStatus();
    }
  }, [currentUserId, chatPartner, checkFriendshipStatus]);

  // Poll for friend requests
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      if (currentUserId) {
        loadFriendRequests();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, loadFriendRequests]);

  // Sync refs
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    inQueueRef.current = inQueue;
    
    // --- QUEUE HEARTBEAT ---
    if (inQueue && socket?.connected) {
      const heartbeat = setInterval(() => {
        socket.emit('queue-heartbeat', { userId: currentUserId });
      }, 3000);
      
      const watchdog = setTimeout(() => {
        console.log("🐶 Watchdog: Stuck at #0 for 10s. Re-joining queue...");
        if (socket?.connected) {
          joinQueue();
        }
      }, 10000);
      
      queueWatchdogRef.current = { heartbeat, watchdog };
    } else {
      if (queueWatchdogRef.current) {
        clearInterval(queueWatchdogRef.current.heartbeat);
        clearTimeout(queueWatchdogRef.current.watchdog);
      }
    }

    return () => {
      if (queueWatchdogRef.current) {
        clearInterval(queueWatchdogRef.current.heartbeat);
        clearTimeout(queueWatchdogRef.current.watchdog);
      }
    };
  }, [inQueue, queuePosition, joinQueue, socket, currentUserId]);

  // Handle ESC Key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (chatId && e.key === 'Escape') {
        setShowWarning(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatId]);

  // Toast Timer
  useEffect(() => {
    if (!actionToast) return;
    const t = setTimeout(() => setActionToast(null), 2000);
    return () => clearTimeout(t);
  }, [actionToast]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        container.scrollTop = container.scrollHeight;
      }, 200);
    }
  }, [messages, chatId]);





  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.message-actions')) {
        setShowActions(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (msg) => {
      // For friend chats, show all messages. For random chats, prevent echo
      if (chatId?.startsWith('friend_') || msg.userId !== currentUserId) {
        setMessages(prev => {
          // Prevent duplicates by checking if message already exists
          const exists = prev.some(existingMsg => existingMsg.id === msg.id);
          if (exists) return prev;
          return [...prev, { ...msg, reactions: msg.reactions || {} }];
        });
      }
    };

    const handleMessageReaction = ({ messageId, emoji, userId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji].push(userId);
          }
          return { ...msg, reactions };
        }
        return msg;
      }));
    };

    const handlePartnerDisconnected = () => {
      console.log('📢 FRONTEND: Received partner-disconnected event!');
      console.log('📢 Current chatId:', chatId);
      console.log('📢 Current partner:', chatPartner);
      
      // 1. Clear current chat state
      setChatId(null);
      setChatPartner(null);
      setMessages([]);
      setReplyingTo(null);
      setShowActions(null);
      
      // 2. Show a brief toast notification instead of blocking popup
      setActionToast("Partner left. Searching for new match...");

      // 3. AUTOMATICALLY Join Queue
      console.log("Partner disconnected, auto-rejoining queue...");
      joinQueue(); 
      // Note: joinQueue sets setInQueue(true) internally
    };

    const handleQueueHeartbeatResponse = (data) => {
      if (!data.inQueue && inQueue) {
        console.log('💔 Server says not in queue, re-joining...');
        joinQueue();
      }
    };

    const handleFriendRequestReceived = () => loadFriendRequests();
    // Removed - now handled by App.js

    socket.on('new-message', handleNewMessage);
    socket.on('message-reaction', handleMessageReaction);
    socket.on('partner-disconnected', handlePartnerDisconnected);
    socket.on('friend-request-received', handleFriendRequestReceived);
    socket.on('queue-heartbeat-response', handleQueueHeartbeatResponse);
    
    // Listen for friend messages even when not in chat
    socket.on('friend-message-received', (messageData) => {
      // Only add if it's for the current chat
      if (messageData.chatId === chatId) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === messageData.id);
          if (exists) return prev;
          return [...prev, { ...messageData, reactions: messageData.reactions || {} }];
        });
      }
    });

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-reaction', handleMessageReaction);
      socket.off('partner-disconnected', handlePartnerDisconnected);
      socket.off('friend-request-received', handleFriendRequestReceived);
      socket.off('queue-heartbeat-response', handleQueueHeartbeatResponse);
      socket.off('friend-message-received');
    };
  }, [socket, currentUserId, chatPartner, loadFriendRequests, inQueue, joinQueue, chatId]);

  // Initialize chat based on props
  useEffect(() => {
    console.log('🔄 ChatPage initialization:', { initialChatData, targetFriend, currentUserId, currentUsername });
    
    if (initialChatData) {
      // Random chat from queue
      const myId = currentUserId;
      const partner = initialChatData.users.find(u => (u.id || u.userId) !== myId);
      if (partner) {
        console.log('🎲 Setting up random chat:', partner);
        setChatId(initialChatData.chatId);
        setChatPartner(partner);
        setInQueue(false);
        setQueuePosition(0);
        setMessages([]);
        setNotification(null);
        socket?.emit('join-chat', { chatId: initialChatData.chatId });
      }
    } else if (targetFriend && currentUserId && currentUsername) {
      // Friend chat from inbox - only proceed if we have user info
      console.log('👥 Setting up friend chat:', targetFriend);
      setChatId(targetFriend.chatId);
      setChatPartner(targetFriend);
      setInQueue(false);
      setQueuePosition(0);
      setNotification(null);
      socket?.emit('join-chat', { chatId: targetFriend.chatId });
      
      // Load message history for friend chats
      const loadMessages = async () => {
        try {
          console.log('📚 Loading message history for:', targetFriend.chatId);
          const history = await api.getFriendChatMessages(targetFriend.chatId);
          console.log('📚 Loaded messages:', history);
          
          const formattedMessages = history.map(msg => ({
            id: msg.id,
            chatId: msg.chat_id,
            message: msg.message,
            userId: msg.sender_id,
            username: msg.sender_id === currentUserId ? currentUsername : targetFriend.username,
            timestamp: msg.created_at,
            reactions: {}
          }));
          
          console.log('📚 Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
        } catch (error) {
          console.error('❌ Error loading message history:', error);
          setMessages([]);
        }
      };
      loadMessages();
      
      // Mark messages as read for friend chats
      if (targetFriend.userId) {
        api.markMessagesAsRead(currentUserId, targetFriend.userId).catch(console.error);
      }
    }
  }, [initialChatData, targetFriend, currentUserId, currentUsername, socket]);




  const leaveQueue = async () => {
    try {
      await api.leaveQueue(currentUserId);
      setInQueue(false);
      setQueuePosition(0);
      setNotification(null);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!chatId || !currentUserId) return;
    
    if (!socket?.connected) {
        setActionToast('Connection lost');
        return;
    }

    const messageData = {
      id: Date.now(),
      chatId,
      message: newMessage.trim(),
      userId: currentUserId,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      replyTo: replyingTo,
      reactions: {}
    };

    // For random chats, add locally for immediate feedback
    // For friend chats, let the socket handler add it to prevent duplicates
    if (!chatId?.startsWith('friend_')) {
      setMessages(prev => [...prev, messageData]);
    }
    
    socket.emit('send-message', messageData);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleReaction = (messageId, emoji) => {
    if (!chatId || !currentUserId || !socket) return;
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        Object.keys(reactions).forEach(existingEmoji => {
          reactions[existingEmoji] = reactions[existingEmoji].filter(uid => uid !== currentUserId);
          if (reactions[existingEmoji].length === 0) {
            delete reactions[existingEmoji];
          }
        });
        return { ...msg, reactions };
      }
      return msg;
    }));
    
    socket.emit('add-reaction', { chatId, messageId, emoji, userId: currentUserId });
    setShowActions(null);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setShowActions(null);
    inputRef.current?.focus();
  };

  const handleLongPress = (messageId) => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(messageId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleMouseEnter = (messageId) => {
    if (!isMobile) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setShowActions(messageId);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimer.current = setTimeout(() => {
        setShowActions(null);
      }, 2000);
    }
  };

  const handleSwipeStart = (e) => {
    const touch = e.touches[0];
    swipeStartX.current = touch.clientX;
    swipeStartY.current = touch.clientY;
  };

  const handleSwipeEnd = (e) => {
    if (!swipeStartX.current || !swipeStartY.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX.current;
    const deltaY = touch.clientY - swipeStartY.current;
    
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -100) {
      setShowWarning(true);
    }
    
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const confirmLeaveChat = () => {
    setShowWarning(false);
    if (chatPartner) {
      setPartnerToReview(chatPartner);
      setShowReviewPopup(true);
    } else {
      finishLeavingChat();
    }
  };

  const finishLeavingChat = () => {
    if (chatId && socket && currentUserId) {
      // Use atomic skip-partner event for better UX
      socket.emit('skip-partner', { chatId, userId: currentUserId });
      setChatId(null);
      setChatPartner(null);
      setMessages([]);
      setReplyingTo(null);
      setShowActions(null);
      setPartnerToReview(null);
      setInQueue(true);
      setQueuePosition(0);
    }
  };

  const handleBlockUser = async () => {
    if (!chatPartner || !currentUserId) return;
    try {
      await api.blockUser(currentUserId, chatPartner.userId);
      setActionToast('User blocked');
    } catch (error) {
      console.error('Error blocking user:', error);
      setActionToast('Failed to block user');
    }
  };

  const handleAddFriend = async () => {
    console.log('🚀 Starting friend request process...');
    
    if (!chatPartner || !currentUserId) {
      console.error('❌ Missing chatPartner or currentUserId');
      console.log('chatPartner:', chatPartner);
      console.log('currentUserId:', currentUserId);
      return;
    }
    
    console.log('🔍 Full chatPartner object:', JSON.stringify(chatPartner, null, 2));
    console.log('🔍 Current user ID:', currentUserId);
    
    // The chatPartner should have the partner's id or userId, not our own
    const partnerId = chatPartner.id || chatPartner.userId;
    console.log('🔍 Extracted partner ID:', partnerId);
    
    // Make sure we're not sending a friend request to ourselves
    if (partnerId === currentUserId) {
      console.error('❌ Cannot send friend request to yourself!');
      console.log('Partner ID matches current user ID - this is wrong!');
      setActionToast('Cannot add yourself as friend');
      return;
    }
    
    if (!partnerId) {
      console.error('❌ Partner ID not found in chatPartner object');
      setActionToast('Unable to send friend request');
      return;
    }
    
    console.log('✅ Validation passed, sending friend request...');
    console.log('From:', currentUserId);
    console.log('To:', partnerId);
    
    try {
      const result = await api.sendFriendRequest(currentUserId, partnerId);
      console.log('✅ Friend request API response:', result);
      setActionToast('Friend request sent');
    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      setActionToast('Friend requests temporarily unavailable');
    }
  };

  const handleAcceptFriend = async (requestId) => {
    console.log('👍 Accepting friend request:', requestId);
    console.log('Current user accepting:', currentUserId);
    try {
      const result = await api.acceptFriendRequest(requestId, currentUserId);
      console.log('✅ Accept friend API response:', result);
      setActionToast('Friend request accepted');
      loadFriendRequests();
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
    }
  };

  const handleNextUser = () => {
    setShowWarning(true);
  };

  const handleReviewSubmit = (reviewData) => {
    switch (reviewData.action) {
      case 'friend': setActionToast('Friend request sent'); break;
      case 'block': setActionToast('User blocked'); break;
      case 'report': setActionToast('User reported'); break;
      default: break;
    }
    
    setShowReviewPopup(false);
    setPartnerToReview(null);
    
    if (notification === 'partner-disconnected') {
      joinQueue();
    } else {
      finishLeavingChat();
    }
  };




  // --- RENDER: CHAT UI ---
  if (chatId && chatPartner) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col font-sans h-[100dvh]">
        {/* Header - Different for friend vs random chat */}
        <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-white tracking-wide">
                  {chatPartner?.username?.[0]?.toUpperCase() || '?'}
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100 leading-tight">
                  {chatPartner?.username || 'Stranger'}
                </span>
                <span className="text-[10px] font-medium text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Online
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2">
            {chatId?.startsWith('friend_') ? (
              // Friend chat header - simple: block and home only
              <>
                <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">
                    B
                  </div>
                  <span className="text-xs font-medium">blahbluh</span>
                </button>
                <button onClick={handleBlockUser} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
                  <BlockIcon />
                </button>
              </>
            ) : (
              // Random chat header - full: logo, inbox, add friend, next
              <>
                <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 mr-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">
                    B
                  </div>
                  <span className="text-xs font-medium">blahbluh</span>
                </button>
                <button onClick={onInboxOpen} className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 relative">
                  Inbox
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
                  )}
                </button>
                {isAlreadyFriend ? (
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-800 text-green-400 transition-all">
                    <CheckIcon />
                  </div>
                ) : (
                  <button onClick={handleAddFriend} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all active:scale-95">
                    <UserPlusIcon />
                  </button>
                )}
                <button onClick={handleBlockUser} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
                  <BlockIcon />
                </button>
                <button onClick={handleNextUser} className="hidden md:flex ml-2 pl-4 pr-5 py-2 rounded-full bg-white text-black font-bold text-xs items-center gap-1.5 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                  <span>Next</span>
                  <NextIcon />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto overflow-hidden">
          {/* Mobile Hint */}
          <div className="md:hidden absolute top-20 left-0 right-0 z-10 flex justify-center pointer-events-none opacity-60">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-[10px] text-zinc-400 animate-pulse">
                <SwipeUpIcon />
                <span>Swipe up to skip</span>
             </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 pt-24 pb-4 space-y-3"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            {messages.map((msg, index) => {
              const isOwn = msg.userId === currentUserId;
              const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo.id) : null;
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

              return (
                <div key={msg.id || index} className={`group flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[80%] sm:max-w-[70%]`}>
                    
                    <div
                      className={`relative px-4 py-2.5 shadow-sm transition-all duration-200 cursor-default
                        ${isOwn 
                          ? 'bg-blue-600 text-white rounded-[20px] rounded-br-sm' 
                          : 'bg-zinc-800 text-gray-100 rounded-[20px] rounded-bl-sm' 
                        }
                      `}
                      onTouchStart={() => handleLongPress(msg.id)}
                      onTouchEnd={handleTouchEnd}
                      onMouseEnter={() => handleMouseEnter(msg.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {replyMsg && (
                        <div className={`mb-1 pl-2 py-0.5 border-l-2 text-[10px] mb-2 overflow-hidden ${isOwn ? 'border-white/30 text-white/80' : 'border-zinc-500 text-zinc-400'}`}>
                          <span className="font-bold block">{replyMsg.username}</span>
                          <span className="truncate block opacity-80">{replyMsg.message}</span>
                        </div>
                      )}
                      <div className="text-[15px] leading-relaxed break-words font-normal">
                        {msg.message}
                      </div>
                    </div>

                    {hasReactions && (
                      <div className={`absolute -bottom-2 ${isOwn ? 'right-0' : 'left-0'} z-10 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 shadow-lg scale-90`}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <div key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="cursor-pointer hover:scale-125 transition-transform text-xs">
                            {emoji} <span className="text-[9px] text-zinc-500 font-mono">{users.length > 1 ? users.length : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {showActions === msg.id && (
                      <div className={`absolute -top-12 ${isOwn ? 'right-0' : 'left-0'} flex items-center gap-2 p-1.5 bg-zinc-800/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10 z-20 animate-in fade-in zoom-in duration-200`}>
                        {['❤️', '😂', '👍', '👎', '🔥'].map(emoji => (
                          <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:scale-125 transition-transform p-1 text-lg leading-none">
                            {emoji}
                          </button>
                        ))}
                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                        <button onClick={() => handleReply(msg)} className="text-zinc-300 hover:text-white p-1">
                          <ReplyIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent shrink-0 z-30">
            <div className="max-w-2xl mx-auto">
              {replyingTo && (
                <div className="flex items-center justify-between px-4 py-2 mb-2 bg-zinc-800/80 backdrop-blur rounded-xl border border-white/5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ReplyIcon />
                    <span className="truncate">Replying to <span className="font-bold text-white">{replyingTo.username}</span></span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-zinc-700 rounded-full">✕</button>
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-end gap-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-1.5 rounded-[28px] shadow-2xl">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type something fun..."
                  className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 px-4 py-3 focus:ring-0 text-[16px]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center
                    ${newMessage.trim() 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-0' 
                      : 'bg-zinc-800 text-zinc-600 rotate-90 cursor-default'
                    }`}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Warning Popup */}
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl scale-100">
              <h3 className="text-lg font-bold text-white text-center mb-2">Skip Chat?</h3>
              <p className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">
                Are you sure you want to disconnect?
                <br/>
                <span className="text-xs text-zinc-500 hidden md:inline-block mt-2">(Press ESC to close)</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowWarning(false)} className="flex-1 py-3.5 rounded-2xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmLeaveChat} className="flex-1 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
                  Yes, Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {actionToast && (
          <div className="fixed top-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium text-white shadow-xl animate-in slide-in-from-top-4 fade-in">
              {actionToast}
            </div>
          </div>
        )}

        {/* Review Popup */}
        {showReviewPopup && partnerToReview && (
          <ReviewPopup
            partner={partnerToReview}
            onClose={() => {
              setShowReviewPopup(false);
              setPartnerToReview(null);
              if (notification === 'partner-disconnected') {
                joinQueue();
              } else {
                finishLeavingChat();
              }
            }}
            onSubmit={handleReviewSubmit}
          />
        )}
      </div>
    );
  }

  // --- RENDER: LANDING / QUEUE UI ---
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full z-10 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-lg shadow-lg shadow-white/10">
            B
          </div>
          <span className="font-bold text-lg tracking-tight text-white">blahbluh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
             {currentUsername || 'guest'}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors relative"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {(friendRequests.length > 0 || notifications.length > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                  {friendRequests.length + notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (friendRequests.length > 0 || notifications.length > 0) && (
              <div className="absolute top-10 right-0 w-80 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                {friendRequests.length > 0 && (
                  <>
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
                  </>
                )}
                {notifications.length > 0 && (
                  <>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {notifications.map(notification => (
                        <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border-l-4 border-green-500">
                          <div>
                            <p className="text-white text-sm font-medium">🎉 {notification.message}</p>
                            <p className="text-gray-400 text-xs">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                            className="px-2 py-1 text-gray-400 hover:text-white text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-full hover:bg-zinc-800"
          >
            Profile
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-lg w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-8">
            <span className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></span>
            <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
              {socket?.connected ? 'System Online' : 'Connecting...'}
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
                <button onClick={leaveQueue} className="mt-4 px-6 py-3 rounded-full bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors">
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
      
      {/* Profile Modal */}
      {showProfile && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;