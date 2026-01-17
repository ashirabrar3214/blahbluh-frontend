import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api';
import ReviewPopup from './ReviewPopup';
import BlockUserPopup from './BlockUserPopup';
import ReportPopup from './ReportPopup';
import PublicProfile from './components/PublicProfile';
import GifPicker from './components/GifPicker';

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
const UserCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
);
const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
);
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
);
const ReportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
);
const EmojiIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
);
const HourglassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
);
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"></line></svg>
);
const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const IcebreakerLoader = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="flex items-end justify-center space-x-1.5 h-8">
      <div className="w-1.5 h-3 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.5s]" />
      <div className="w-1.5 h-5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-1.5 h-7 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.1s]" />
      <div className="w-1.5 h-5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-1.5 h-3 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.5s]" />
    </div>
    <p className="text-sm font-medium text-zinc-400 tracking-wider">
      Generating Icebreaker
    </p>
  </div>
);

const formatIcebreaker = (raw = "") => {
  let s = String(raw || "").trim();

  // Only do "option formatting" if it actually looks like options
  // (2+ option markers = likely MCQ/list)
  const optionCount = (s.match(/\b([A-D]|[1-6])[)\].:-]\s*/g) || []).length;

  if (optionCount >= 2) {
    s = s
      // after punctuation like "?A)" or ".A)"
      .replace(/([?.!])\s*([A-D][)\].:-]\s*)/g, "$1\n$2")
      .replace(/([?.!])\s*([1-6][)\].:-]\s*)/g, "$1\n$2")
      // after comma/semicolon like ",A)"
      .replace(/[,;]\s*([A-D][)\].:-]\s*)/g, "\n$1")
      .replace(/[,;]\s*([1-6][)\].:-]\s*)/g, "\n$1")
      // fallback: any whitespace before the marker
      .replace(/\s+([A-D][)\].:-]\s*)/g, "\n$1")
      .replace(/\s+([1-6][)\].:-]\s*)/g, "\n$1")
      .replace(/^\n+/, "");
  }

  return s;
};

function ChatPage({ socket, user, currentUserId: propUserId, currentUsername: propUsername, initialChatData, targetFriend, onGoHome, onInboxOpen, globalNotifications, globalFriendRequests, setGlobalNotifications, setGlobalFriendRequests, unreadCount, suggestedTopic, setSuggestedTopic, callStatus, onStartCall, onHangupCall, children }) {
  // --- STATE ---
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(propUserId ?? null);
  const [currentUsername, setCurrentUsername] = useState(propUsername ?? null);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const [icebreakerOpen, setIcebreakerOpen] = useState(false);
  const [icebreakerTopic, setIcebreakerTopic] = useState(null);
  const [icebreakerPrompt, setIcebreakerPrompt] = useState(null);
  const topicChatIdRef = useRef(null);

  // Pagination State
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const previousScrollHeightRef = useRef(0);
  const isHistoryLoadRef = useRef(false);


  useEffect(() => {
    setCurrentUserId(propUserId ?? null);
    setCurrentUsername(propUsername ?? null);
  }, [propUserId, propUsername]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);      // messageId
  const [actionMenuView, setActionMenuView] = useState('main');         // 'main' | 'react'
  //const [menuVerticalPosition, setMenuVerticalPosition] = useState('top-1/2 -translate-y-1/2'); // Tries to center, falls back to top/bottom
  const [actionMenuCoords, setActionMenuCoords] = useState({ top: 0, left: 0 }); // New state for menu position
  // Use global state instead of local state
  const friendRequests = globalFriendRequests;
  const notifications = globalNotifications;
  const setFriendRequests = setGlobalFriendRequests;

  // Debug logging for notification counts
  useEffect(() => {
    console.log('NOTIFICATION DEBUG: ChatPage notification counts - friendRequests:', friendRequests.length, 'notifications:', notifications.length, 'total:', friendRequests.length + notifications.length);
  }, [friendRequests.length, notifications.length]);
  const [showWarning, setShowWarning] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [partnerToReview, setPartnerToReview] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [partnerRating, setPartnerRating] = useState(null);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [isRequeuing, setIsRequeuing] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportContext, setReportContext] = useState(null); // { type: 'user' | 'message', data: ... }
  const [isReporting, setIsReporting] = useState(false);

  // --- SWIPE STATE ---
  const [swipeY, setSwipeY] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef(null);
  const touchStartX = useRef(null);

  // --- REFS ---
  const currentUserIdRef = useRef(null);
  
  const skipFlowRef = useRef(false);       // true while YOU initiated skip/review
  const leavingChatIdRef = useRef(null);   // chatId we intend to leave
  const leaveOnceRef = useRef(false);      // prevents double skip-partner emits

  const joinedChatIdRef = useRef(null);    // Prevents join-chat spam
  const partnerDisconnectedRef = useRef(false); // Prevents leave-chat emit on disconnect

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hardExitRef = useRef(false);

  //const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Handle exit to home with call cleanup
  const handleExitToHomeWithCleanup = (requeue) => {
    // We no longer hang up friend calls on exit, as they are global.
    // For random chats, we might want to hang up, but the socket 'leave-chat' will likely handle it or the partner will disconnect.
    // If it's a random chat, we should probably hang up explicitly if we are the one leaving.
    if (!chatId?.startsWith('friend_') && callStatus !== 'idle') {
       onHangupCall();
    }
    handleExitToHome(requeue);
  };

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

  // --- EFFECT HOOKS ---

  // Set initial state from props
  useEffect(() => {
    if (propUserId && propUsername) {
      setCurrentUserId(propUserId);
      setCurrentUsername(propUsername);
    }
  }, [propUserId, propUsername]);

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

  // Load partner PFP separately to ensure it's up to date
  useEffect(() => {
    const partnerId = chatPartner?.userId || chatPartner?.id;
    if (!partnerId) return;

    let ignore = false;
    const loadPfp = async () => {
      try {
        const pfpData = await api.getUserPfp(partnerId).catch(() => null);
        if (!ignore && pfpData) {
          const pfpUrl = pfpData.pfp || pfpData.pfpLink;
          const pfpBg = pfpData.pfp_background;
          if (pfpUrl || pfpBg) {
            setChatPartner(prev => {
              const prevId = prev?.userId || prev?.id;
              // Only update if it's the same user and PFP is different
              if (prevId === partnerId && (prev.pfp !== pfpUrl || prev.pfp_background !== pfpBg)) {
                return { ...prev, pfp: pfpUrl || prev.pfp, pfp_background: pfpBg || prev.pfp_background };
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Error loading partner PFP:', error);
      }
    };
    loadPfp();
    return () => { ignore = true; };
  }, [chatPartner?.userId, chatPartner?.id]);

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

  // Toast Timer
  useEffect(() => {
    if (!actionToast) return;
    const t = setTimeout(() => setActionToast(null), 2000);
    return () => clearTimeout(t);
  }, [actionToast]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      if (isHistoryLoadRef.current) {
        // Restore scroll position after loading history
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
        isHistoryLoadRef.current = false;
      } else {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
  }, [messages, chatId]);

  // Click Outside (works with fixed menus too)
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!activeActionMenu) return;

      const t = event.target;

      // If click is inside the action button container OR inside the fixed menu, ignore
      if (t.closest('.message-actions-container') || t.closest('.action-menu-fixed')) return;

      setActiveActionMenu(null);
      setActionMenuView('main');
    };

    // capture=true so it runs before other click handlers
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [activeActionMenu]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;
  
    // No icebreaker for friend chats
    if (chatId.startsWith('friend_')) {
      setIcebreakerOpen(false);
      setIcebreakerTopic(null);
      setIcebreakerPrompt(null);
      return;
    }
  
    // Prevent refetch spam for same chatId
    if (topicChatIdRef.current === chatId) return;
    topicChatIdRef.current = chatId;
  
    // Every new chatId => new prompt
    setIcebreakerOpen(true);
    setPromptAnswer('');
    setIcebreakerTopic(null);
    setIcebreakerPrompt(null);
  
    api.suggestTopic(currentUserId)
      .then((data) => {
        if (topicChatIdRef.current !== chatId) return; // stale guard
        
        const raw = data?.prompt ?? data?.suggestion ?? data;
        const promptObj =
          typeof raw === "string"
            ? { kind: "text", text: raw, options: [] }
            : {
                kind: raw.kind === "mcq" ? "mcq" : "text",
                text: raw.text || "",
                options: Array.isArray(raw.options) ? raw.options : []
              };

        setIcebreakerPrompt(promptObj);
        setIcebreakerTopic(promptObj.text || "What's on your mind?");
        setPromptAnswer("");
      })
      .catch(() => {
        if (topicChatIdRef.current !== chatId) return;
        setIcebreakerTopic("What's on your mind?");
        setIcebreakerPrompt({ kind: "text", text: "What's on your mind?", options: [] });
      });
  }, [chatId, currentUserId, setSuggestedTopic]);

  // Reset swipe state when icebreaker opens/closes
  useEffect(() => {
    if (!icebreakerOpen) {
      setSwipeY(0);
      setSwipeX(0);
      setIsSwiping(false);
    }
  }, [icebreakerOpen]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleChatPaired = (payload) => {
      console.log('ChatPage: Re-paired via socket', payload);

      const newPartner = payload.users?.find(
        (u) => (u.id || u.userId) !== currentUserId
      );

      if (!newPartner) return;

      const newChatId = payload.chatId;

      // 1) Switch UI to the new chat
      setChatId(newChatId);
      setChatPartner(newPartner);
      setMessages([]);
      setPromptAnswer(''); // reset whatever they typed last time
      setIsRequeuing(false);

      // 2) Join the new room (and update the ref FIRST)
      joinedChatIdRef.current = newChatId;
      socket.emit('join-chat', { chatId: newChatId });

      // 3) Always ensure we have a prompt topic for the popup
      if (payload.topic) {
        setSuggestedTopic(payload.topic);
        return;
      }

      // Server didn't provide a topic -> fetch one here
      setSuggestedTopic(null); // optional: clears previous topic before we set the new one
      api.suggestTopic(currentUserId)
        .then((data) => {
          // stale guard: ignore if we already moved to another chat
          if (joinedChatIdRef.current !== newChatId) return;
          setSuggestedTopic(data?.suggestion || "What's on your mind?");
        })
        .catch((err) => {
          console.error('ChatPage: Failed to fetch topic for new pairing:', err);
          if (joinedChatIdRef.current !== newChatId) return;
          setSuggestedTopic("What's on your mind?");
        });
    };


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
      // We already applied our own reaction optimistically in handleReaction().
      // If we process our own broadcast too, it toggles off (appears then disappears).
      if (userId === currentUserId) return;

      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = { ...(msg.reactions || {}) };

          const userPreviousReaction = Object.keys(newReactions).find(e => newReactions[e].includes(userId));

          if (userPreviousReaction) {
            newReactions[userPreviousReaction] = newReactions[userPreviousReaction].filter(uid => uid !== userId);
            if (newReactions[userPreviousReaction].length === 0) {
              delete newReactions[userPreviousReaction];
            }
          }

          if (userPreviousReaction !== emoji) {
            if (!newReactions[emoji]) newReactions[emoji] = [];
            newReactions[emoji].push(userId);
          }

          return { ...msg, reactions: newReactions };
        }
        return msg;
      }));
    };

    const handlePartnerDisconnected = (payload = {}) => {
      const {
        chatId: disconnectedChatId, 
        // eslint-disable-next-line no-unused-vars
        shouldRequeue = true
      } = payload;

      // Only act if we are currently in THIS chat
      if (!chatId) return;
      if (disconnectedChatId && chatId !== disconnectedChatId) return;

      // If this disconnect is from our own skip flow, ignore it (defensive)
      if (skipFlowRef.current && leavingChatIdRef.current === chatId) {
        return;
      }

      // Friend chats shouldn't throw you into random queue
      if (chatId.startsWith('friend_')) {
        setActionToast('Friend disconnected');
        return;
      }

      // Random chat: DON'T flip ChatPage into queue UI.
      // App.js will force navigation to the real HomePage.
      partnerDisconnectedRef.current = true;
      setActionToast('Partner disconnected');
      return;
    };


    const handleFriendRequestReceived = () => loadFriendRequests();

    socket.on('chat-paired', handleChatPaired);
    socket.on('new-message', handleNewMessage);
    socket.on('message-reaction', handleMessageReaction);
    socket.on('partner-disconnected', handlePartnerDisconnected);
    socket.on('friend-request-received', handleFriendRequestReceived);

    
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
      socket.off('chat-paired', handleChatPaired);
      socket.off('new-message', handleNewMessage);
      socket.off('message-reaction', handleMessageReaction);
      socket.off('partner-disconnected', handlePartnerDisconnected);
      socket.off('friend-request-received', handleFriendRequestReceived);
      socket.off('friend-message-received');
    };
  }, [socket, currentUserId, chatPartner, loadFriendRequests, chatId, setSuggestedTopic]);
  // Notify server when user leaves chat via navigation (Home button)
  useEffect(() => {
      // Reset flag when entering a new chat
      if (chatId) {
        partnerDisconnectedRef.current = false;
      }
      return () => {
        if (hardExitRef.current) return;
        if (partnerDisconnectedRef.current) return; // ✅ Don't emit if partner already disconnected
        if (skipFlowRef.current) return;
        if (chatId && socket?.connected && currentUserId) {
          socket.emit('leave-chat', {
            chatId,
            userId: currentUserId
          });
        }
      };
    }, [chatId, socket, currentUserId]);

  // Initialize chat based on props
  useEffect(() => {
    console.log('ChatPage initialization:', { initialChatData, targetFriend, currentUserId, currentUsername });
    
    if (initialChatData) {
      // Random chat from queue
      if (!currentUserId) return; // <-- hard guard, prevents wrong partner selection

      const myId = currentUserId;
      const partner = initialChatData.users.find(u => (u.id || u.userId) !== myId);
      if (partner) {
        console.log('Setting up random chat:', partner);
        setIsRequeuing(false);
        setChatId(initialChatData.chatId);
        setChatPartner(partner);
        setMessages([]);
        setHasMore(false);
        setSuggestedTopic(initialChatData.topic || null);

        // ✅ Prevent join-chat spam
        if (initialChatData.chatId !== joinedChatIdRef.current) {
          joinedChatIdRef.current = initialChatData.chatId;
          socket?.emit('join-chat', { chatId: initialChatData.chatId });
        }
      }
    } else if (targetFriend && currentUserId && currentUsername) {
      // Friend chat from inbox - only proceed if we have user info
      console.log('Setting up friend chat:', targetFriend);
      setIsRequeuing(false);
      setChatId(targetFriend.chatId);
      setChatPartner(targetFriend);
      // ✅ Prevent join-chat spam
      if (targetFriend.chatId !== joinedChatIdRef.current) {
        joinedChatIdRef.current = targetFriend.chatId;
        socket?.emit('join-chat', { chatId: targetFriend.chatId });
      }
      
      // Load message history for friend chats
      const loadMessages = async () => {
        try {
          console.log('Loading message history for:', targetFriend.chatId);
          const history = await api.getFriendChatMessages(targetFriend.chatId, null, 50);
          console.log('Loaded messages:', history);
          
          const formattedMessages = history.map(msg => ({
            id: msg.id,
            chatId: msg.chat_id,
            message: msg.message,
            userId: msg.sender_id,
            username: msg.sender_id === currentUserId ? currentUsername : targetFriend.username,
            timestamp: msg.created_at,
            reactions: {}
          }));
          
          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
          setHasMore(history.length >= 50);
        } catch (error) {
          console.error('Error loading message history:', error);
          setMessages([]);
          setHasMore(false);
        }
      };
      loadMessages();
      
      // Mark messages as read for friend chats
      if (targetFriend.userId) {
        api.markMessagesAsRead(currentUserId, targetFriend.userId).catch(console.error);
      }
    }
  }, [initialChatData, targetFriend, currentUserId, currentUsername, socket, setSuggestedTopic]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !chatId) return;
    
    setLoadingMore(true);
    isHistoryLoadRef.current = true;
    
    if (messagesContainerRef.current) {
      previousScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
    }

    try {
      const oldestMsg = messages[0];
      if (!oldestMsg) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const history = await api.getFriendChatMessages(chatId, oldestMsg.timestamp, 50);
      
      if (history.length < 50) {
        setHasMore(false);
      }

      const formattedMessages = history.map(msg => ({
        id: msg.id,
        chatId: msg.chat_id,
        message: msg.message,
        userId: msg.sender_id,
        username: msg.sender_id === currentUserId ? currentUsername : (chatPartner?.username || 'Partner'),
        timestamp: msg.created_at,
        reactions: {}
      }));

      setMessages(prev => [...formattedMessages, ...prev]);
    } catch (error) {
      console.error('Error loading more messages:', error);
      isHistoryLoadRef.current = false;
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  const handlePromptSubmit = (answerOverride = null) => {
    if (!chatId || !currentUserId) return;

    const answer = (typeof answerOverride === 'string' ? answerOverride : promptAnswer).trim();
    if (!answer) return;
    
    if (!socket?.connected) {
        setActionToast('Connection lost');
        return;
    }

    let messageContent = answer;
    if (icebreakerPrompt?.kind === 'mcq' && icebreakerPrompt.options?.length) {
      messageContent = icebreakerPrompt.options
        .map(opt => (opt === answer ? `● ${opt}` : `○ ${opt}`))
        .join('\n');
    }

    const messageData = {
      id: Date.now(),
      chatId,
      message: messageContent,
      prompt: icebreakerTopic,
      userId: currentUserId,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      replyTo: null,
      reactions: {}
    };

    // Add locally for immediate feedback
    setMessages(prev => [...prev, messageData]);
    
    socket.emit('send-message', messageData);
    
    // Clear prompt and answer
    setIcebreakerOpen(false);
    setIcebreakerTopic(null);
    setIcebreakerPrompt(null);
    setSuggestedTopic?.(null); // optional, harmless
    setPromptAnswer('');
  };


  const handleExitToHome = async (requeuePartner = false) => {
    // Mark this as a controlled, hard exit. This prevents the unmount
    // effect from firing a duplicate `leave-chat` event.
    hardExitRef.current = true;
    joinedChatIdRef.current = null;

    // Tell the server to end the active chat.
    if (socket?.id) {
      try {
        await api.exitChat(socket.id, currentUserId, chatId, requeuePartner);
      } catch (error) {
        console.error("Error exiting chat:", error);
      }
    }

    onGoHome?.();
  };

  const handleSendGif = (url) => {
    if (!chatId || !currentUserId) return;
    
    if (!socket?.connected) {
        setActionToast('Connection lost');
        return;
    }

    const messageData = {
      id: Date.now(),
      chatId,
      message: url,
      type: 'gif',
      userId: currentUserId,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      replyTo: null,
      reactions: {}
    };

    if (!chatId?.startsWith('friend_')) {
      setMessages(prev => [...prev, messageData]);
    }
    
    socket.emit('send-message', messageData);
    setShowGifPicker(false);
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
    
    // Optimistically update the UI for a responsive feel
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newReactions = { ...(msg.reactions || {}) };

          const userPreviousReaction = Object.keys(newReactions).find(e => newReactions[e].includes(currentUserId));

          // If the user had a previous reaction, remove it
          if (userPreviousReaction) {
            newReactions[userPreviousReaction] = newReactions[userPreviousReaction].filter(uid => uid !== currentUserId);
            if (newReactions[userPreviousReaction].length === 0) {
              delete newReactions[userPreviousReaction];
            }
          }

          // If the new emoji is different from the previous one (i.e., not just toggling off), add it
          if (userPreviousReaction !== emoji) {
            if (!newReactions[emoji]) {
              newReactions[emoji] = [];
            }
            newReactions[emoji].push(currentUserId);
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
    
    // Emit the reaction event to the server
    socket.emit('add-reaction', { chatId, messageId, emoji, userId: currentUserId });
    setActiveActionMenu(null);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setActiveActionMenu(null);
    inputRef.current?.focus();
  };

  const finishLeavingChat = (chatIdOverride) => {
    const cid = chatIdOverride || chatId;
    if (!cid || !socket || !currentUserId) return;

    skipFlowRef.current = true;

    // Prevent double skip emits for the same chatId
    if (leaveOnceRef.current && leavingChatIdRef.current === cid) return;
    leaveOnceRef.current = true;
    leavingChatIdRef.current = cid;

    socket.emit('skip-partner', {
      chatId: cid,
      userId: currentUserId,
      reason: hardExitRef.current ? 'exit' : 'skip'
    });

    joinedChatIdRef.current = null;
    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    setReplyingTo(null);
    setActiveActionMenu(null);
    setPartnerToReview(null);
    setSuggestedTopic(null);
    setPromptAnswer('');
    setIcebreakerOpen(false);
    setIcebreakerTopic(null);
    setIcebreakerPrompt(null);
    topicChatIdRef.current = null;

    // Instead of going home, show a "searching" state until the next match.
    setIsRequeuing(true);

    // Reset guard shortly after
    setTimeout(() => {
      leaveOnceRef.current = false;
      leavingChatIdRef.current = null;
      skipFlowRef.current = false;
    }, 500);
    
  };

  const confirmLeaveChat = async () => {
    setShowWarning(false);

    const partner = chatPartner;
    if (!partner || !chatId) {
      finishLeavingChat(chatId);
      return;
    }
    
    // If the skip is initiated from an active icebreaker, bypass the review popup
    const isIcebreakerActive = icebreakerOpen && !chatId.startsWith('friend_');
    if (isIcebreakerActive) {
      finishLeavingChat(chatId);
      return;
    }

    // mark that THIS disconnect is expected (we initiated it)
    skipFlowRef.current = true;
    leavingChatIdRef.current = chatId;
    leaveOnceRef.current = false;

    const partnerId = partner.userId || partner.id;

    setPartnerToReview({ ...partner, userId: partnerId });
    setExistingRating(0);
    setShowReviewPopup(true);

    try {
      const res = await api.getReview(currentUserId, partnerId);
      setExistingRating(res?.rating ?? 0);
    } catch {
      setExistingRating(0);
    }

    try {
      const ratingData = await api.getUserRating(partnerId);
      setPartnerRating(ratingData);
    } catch (error) {
      console.error("Failed to fetch partner rating", error);
      setPartnerRating(null);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    const cid = chatId; // capture NOW
    const rating = Number(reviewData?.rating || 0);
    const partnerId = partnerToReview?.userId || partnerToReview?.id;

    try {
      // 1️⃣ Save rating first
      if (rating > 0 && partnerId && currentUserId) {
        await api.submitReview(currentUserId, partnerId, rating);
      }
    } catch (e) {
      console.error('Review submit failed:', e);
    } finally {
      // 2️⃣ Close popup UI
      setShowReviewPopup(false);
      setPartnerToReview(null);
      setExistingRating(null);
      setPartnerRating(null);

      // 3️⃣ NOW actually skip the user (THIS WAS MISSING)
      finishLeavingChat(cid);
    }
  };

  // --- SWIPE HANDLERS ---
  const handleIcebreakerTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleIcebreakerTouchMove = (e) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - touchStartY.current;
    const diffX = currentX - touchStartX.current;
    
    // Only allow swiping up (negative diffY)
    if (diffY < 0) {
      setSwipeY(diffY);
      setSwipeX(diffX);
    }
  };

  const handleIcebreakerTouchEnd = () => {
    if (touchStartY.current === null) return;
    setIsSwiping(false);
    touchStartY.current = null;
    touchStartX.current = null;

    if (swipeY < -150) {
      setSwipeY(-1000); // Animate off screen
      setSwipeX(swipeX * 1.5); // Continue horizontal momentum
      setTimeout(() => confirmLeaveChat(), 300);
    } else {
      setSwipeY(0); // Bounce back
      setSwipeX(0);
    }
  };

  // ACTION HANDLERS (REQUIRED)

  const handleNextUser = () => {
    setActiveActionMenu(null);
    setShowWarning(true);
  };

  const handleAddFriend = async () => {
    if (!chatPartner || !currentUserId || isAddingFriend) return;

    const partnerId = chatPartner.userId || chatPartner.id;
    if (!partnerId) return;

    setIsAddingFriend(true);
    try {
      await api.sendFriendRequest(currentUserId, partnerId);
      setActionToast('Friend request sent');
    } catch (err) {
      console.error('handleAddFriend failed:', err);
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!chatPartner || !currentUserId || isAddingFriend) return;

    const partnerId = chatPartner.userId || chatPartner.id;
    if (!partnerId) return;

    setIsAddingFriend(true);
    try {
      await api.removeFriend(currentUserId, partnerId);
      setActionToast('Friend removed');
      setIsAlreadyFriend(false);
    } catch (err) {
      console.error('handleRemoveFriend failed:', err);
      setActionToast('Failed to remove friend');
    } finally {
      setIsAddingFriend(false);
    }
  };


  const handleBlockUser = () => {
    setShowBlockPopup(true);
  };

  const confirmBlockUser = async () => {
    if (!chatPartner || !currentUserId) return;

    const partnerId = chatPartner.userId || chatPartner.id;
    if (!partnerId) return;

    try {
      await api.blockUser(currentUserId, partnerId);
      setShowBlockPopup(false);
      // Block implies leave, but we skip the review popup.
      finishLeavingChat();
      
      if (chatId?.startsWith('friend_')) {
        onInboxOpen ? onInboxOpen() : onGoHome?.();
      } else {
        // Block implies leave, but we skip the review popup.
        finishLeavingChat();
      }
    } catch (err) {
      console.error('handleBlockUser failed:', err);
    }
  };

  const handleReportUser = () => {
    setShowBlockPopup(false);
    setReportContext({ type: 'user', data: chatPartner });
    setShowReportPopup(true);
  };

  const handleReport = (message) => {
    setActiveActionMenu(null);
    setReportContext({ type: 'message', data: message });
    setShowReportPopup(true);
  };

  const handleReportSubmit = async (selectedReason) => {
    if (!reportContext || !currentUserId) return;
    
    // Map Title Case reasons to mixed case to match likely DB constraints
    const reasonMapping = {
      "Hate Speech": "hate_speech",
      "Racism": "racism",
      "Violence": "violence",
      "Inappropriate Behavior": "inappropriate_behavior",
      "Nude Selling": "nude_selling",
      "Asking Personal Info": "asking_personal_info",
      "Others": "other"
    };
    const dbReason = reasonMapping[selectedReason] || "other";

    setIsReporting(true);
    try {
      const reportedUser = reportContext.type === 'user' ? reportContext.data : { userId: reportContext.data.userId, username: reportContext.data.username };
      
      // Send the last 10 messages (approx 5 pairs) to provide context
      const lastMessages = messages.slice(-10); 

      const reportData = {
        reporter_user_id: currentUserId,
        reporter_username: currentUsername,
        reported_user_id: reportedUser.userId || reportedUser.id,
        reported_username: reportedUser.username,
        reason: dbReason,
        last_message_json: lastMessages,
        created_at: new Date().toISOString()
      };

      console.log('Submitting report with data:', reportData);
      await api.submitReport(reportData);
      setActionToast('Report submitted. Thank you.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      setActionToast('Failed to submit report.');
    } finally {
      setIsReporting(false);
      setShowReportPopup(false);
      setReportContext(null);
    }
  };

  // --- RENDER: CHAT UI ---
  if (isRequeuing) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center font-sans h-[100dvh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin"></div>
          <div className="text-center">
             <h3 className="text-xl font-bold text-white mb-1 mt-4">Finding a new match...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (chatId && chatPartner) {
    const isIcebreakerActive = icebreakerOpen && !chatId.startsWith('friend_');

    return (
      <>
        {/* Main Chat Page - Blurred when icebreaker is active */}
        <div className={`fixed inset-0 bg-black text-white flex flex-col font-sans h-[100dvh] transition-all duration-300 ${isIcebreakerActive ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header - Different for friend vs random chat */}
        <header className="absolute top-0 left-0 right-0 z-20 px-3 py-2 md:px-4 md:py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 grid grid-cols-3 items-center shadow-sm transition-all">
          {/* Left: Exit Button */}
          <div className="justify-self-start">
            <button onClick={() => handleExitToHomeWithCleanup(!chatId?.startsWith('friend_'))} className="flex items-center gap-1.5 md:gap-2 text-zinc-400 hover:text-white transition-colors px-1.5 py-1 md:px-2 md:py-1 rounded-full hover:bg-zinc-800">
              <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain rounded-[15%]" />
              <span className="text-[10px] md:text-xs font-medium">Leave Chat</span>
            </button>
          </div>

          {/* Center: Profile Info */}
          <div 
            className="justify-self-center flex flex-col items-center cursor-pointer"
            onClick={() => chatPartner && setShowPublicProfile(true)}
          >
             <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full shadow-inner">
                {/* Background Layer */}
                <div 
                  className={`absolute inset-0 rounded-full overflow-hidden ${
                    chatPartner?.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}
                  style={chatPartner?.pfp_background ? { backgroundImage: `url(${chatPartner.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />
                {/* PFP Layer */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transform-gpu">
                  {chatPartner?.pfp ? (
                    <img src={chatPartner.pfp} alt={`${chatPartner.username}'s avatar`} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs md:text-sm font-bold text-white tracking-wide">
                      {chatPartner?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                {/* Border Layer */}
                <div className="absolute inset-0 rounded-full border-2 border-black/20 pointer-events-none" />
             </div>
             <span className="text-[10px] md:text-sm font-semibold text-gray-100 leading-tight mt-0.5 md:mt-1.5 max-w-[100px] truncate text-center">
                {chatPartner?.username || 'Stranger'}
             </span>
          </div>

          {/* Right: Action Buttons */}
          <div className="justify-self-end flex items-center gap-1.5 md:gap-2">
            {chatId?.startsWith('friend_') ? (
              // Friend chat header - simple: block only
              <>
                <button 
                  onClick={callStatus === 'idle' ? () => onStartCall(chatId, chatPartner) : onHangupCall}
                  className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                    callStatus === 'idle' 
                      ? 'bg-zinc-800 text-zinc-400 hover:bg-green-900/30 hover:text-green-400' 
                      : 'bg-red-600 text-white animate-pulse'
                  }`}
                >
                  {callStatus === 'idle' ? <PhoneIcon /> : <PhoneOffIcon />}
                </button>
                <button onClick={handleBlockUser} className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
                  <BlockIcon />
                </button>
              </>
            ) : (
              // Random chat header - full: add friend, next
              <>
                {isAlreadyFriend ? (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={isAddingFriend}
                    className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${isAddingFriend ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-800 text-green-400 hover:bg-red-800 hover:text-red-400'}`}
                    title="Remove friend"
                  >
                    {isAddingFriend ? <HourglassIcon /> : <UserCheckIcon />}
                  </button>
                ) : (
                  <button 
                    onClick={handleAddFriend} 
                    disabled={isAddingFriend}
                    className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${isAddingFriend ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                    title="Send friend request"
                  >
                    {isAddingFriend ? <HourglassIcon /> : <UserPlusIcon />}
                  </button>
                )}
                <button onClick={handleBlockUser} className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
                  <BlockIcon />
                </button>
                <button onClick={handleNextUser} className="flex ml-1 pl-2 pr-3 py-1 md:ml-2 md:pl-4 md:pr-5 md:py-2 rounded-full bg-white text-black font-bold text-[10px] md:text-xs items-center gap-1 md:gap-1.5 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                  <span>Next</span>
                  <NextIcon />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto overflow-hidden pt-12">
          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 pt-12 pb-4 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {loadingMore && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-t-blue-500 border-zinc-700 rounded-full animate-spin"></div>
              </div>
            )}
            {messages.map((msg, index) => {
              const isOwn = msg.userId === currentUserId;

              if (msg.prompt) {
                return (
                  <div key={msg.id || index} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[80%] sm:max-w-[70%] w-full`}>
                      <div
                        className={`px-4 py-3 rounded-2xl border ${isOwn ? 'border-blue-500/30 bg-blue-900/20' : 'border-zinc-700 bg-zinc-900/50'}`}
                      >
                        <p className="text-sm text-zinc-400 mb-2 font-medium italic whitespace-pre-line">
                          "{formatIcebreaker(msg.prompt)}"
                        </p>
                        <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              if (msg.userId === 'system') {
                return (
                  <div key={msg.id || index} className="flex w-full justify-center my-4 opacity-75">
                     <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-white/5">
                        {msg.message}
                     </span>
                  </div>
                );
              }

              const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo.id) : null;
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <div key={msg.id || index} className={`group flex w-full items-center gap-2 ${isOwn ? 'justify-end' : 'flex-row-reverse justify-end'}`}>
                    {/* Action button and menu */}
                    <div className="relative message-actions-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          if (activeActionMenu === msg.id) {
                            setActiveActionMenu(null);
                            return;
                          }

                          const rect = e.currentTarget.getBoundingClientRect();
                          const MENU_W = 224; // tailwind w-56 (wider so all 5 emojis fit)
                          const GAP = 8;
                          const PAD = 12;

                          // place menu left for your own msg, right for partner msg
                          let left = isOwn ? rect.left - GAP - MENU_W : rect.right + GAP;
                          left = Math.max(PAD, Math.min(left, window.innerWidth - PAD - MENU_W));

                          // estimate main menu height (react view is smaller but this is safe)
                          const estH = 140;
                          let top = rect.top + rect.height / 2;
                          top = Math.max(PAD + estH / 2, Math.min(top, window.innerHeight - PAD - estH / 2));

                          setActionMenuCoords({ top, left });
                          setActiveActionMenu(msg.id);
                          setActionMenuView('main');
                        }}
                        className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-50 focus:opacity-100"
                      >
                        <MoreIcon />
                      </button>
                      {activeActionMenu === msg.id && (
                        <div
                          className="action-menu-fixed fixed w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            top: actionMenuCoords.top,
                            left: actionMenuCoords.left,
                            transform: 'translateY(-50%)',
                          }}
                        >
                          {actionMenuView === 'react' ? (
                            <div className="px-2 py-2">
                              <div className="flex items-center justify-between gap-1">
                                {['❤️', '😂', '👍', '👎', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      handleReaction(msg.id, emoji);
                                      setActionMenuView('main');
                                    }}
                                    className="p-1 text-xl leading-none hover:scale-110 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleReply(msg)}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left text-zinc-200 hover:bg-zinc-700/70 transition-colors"
                              >
                                <ReplyIcon />
                                <span>Reply</span>
                              </button>
                              <button
                                onClick={() => setActionMenuView('react')}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left text-zinc-200 hover:bg-zinc-700/70 transition-colors"
                              >
                                <EmojiIcon />
                                <span>React</span>
                              </button>
                              <div className="h-px bg-white/10 my-1"></div>
                              <button
                                onClick={() => handleReport(msg)}
                                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-zinc-700/70 transition-colors"
                              >
                                <ReportIcon />
                                <span>Report</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className={`relative max-w-[80%] sm:max-w-[70%]`}>
                      <div className={`relative px-4 py-2.5 shadow-sm transition-all duration-200 cursor-default ${isOwn ? 'bg-blue-600 text-white rounded-[20px] rounded-br-sm' : 'bg-zinc-800 text-gray-100 rounded-[20px] rounded-bl-sm'}`}>
                        {replyMsg && (
                          <div className={`mb-1 pl-2 py-0.5 border-l-2 text-[10px] mb-2 overflow-hidden ${isOwn ? 'border-white/30 text-white/80' : 'border-zinc-500 text-zinc-400'}`}>
                            <span className="font-bold block">{replyMsg.username}</span>
                            <span className="truncate block opacity-80">{replyMsg.message}</span>
                          </div>
                        )}
                        <div className="text-[15px] leading-relaxed break-words font-normal">
                          {msg.type === 'gif' ? (
                            <img src={msg.message} alt="GIF" className="rounded-lg max-w-full h-auto mt-1" loading="lazy" />
                          ) : (
                            msg.message
                          )}
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
                    </div>
                  </div>
                );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent shrink-0 z-30">
            <div className="max-w-2xl mx-auto relative">
              {showGifPicker && (
                <GifPicker onSelect={handleSendGif} onClose={() => setShowGifPicker(false)} />
              )}
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
                <button
                  type="button"
                  onClick={() => setShowGifPicker(!showGifPicker)}
                  className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${showGifPicker ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  <ImageIcon />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type something fun..."
                  className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 px-4 py-3 focus:ring-0 focus:outline-none text-[16px]"
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

        </div>

        {/* Icebreaker Popup */}
        {isIcebreakerActive && (
          <div className="fixed inset-0 bg-black/60 text-white flex flex-col items-center justify-center font-sans h-[100dvh] p-4 z-50 animate-in fade-in duration-300">
            <div 
              className="w-full max-w-md text-center bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl touch-none relative"
              style={{
                transform: `translate(${swipeX}px, ${swipeY}px) rotate(${swipeX * 0.05}deg)`,
                transition: isSwiping ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease',
                opacity: Math.max(0, 1 + (swipeY / 600))
              }}
              onTouchStart={handleIcebreakerTouchStart}
              onTouchMove={handleIcebreakerTouchMove}
              onTouchEnd={handleIcebreakerTouchEnd}
            >
              <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-4 md:hidden" />
              <div className="flex flex-col items-center mb-3 md:mb-5">
                <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full shadow-lg mb-2">
                  {/* Background Layer */}
                  <div 
                    className={`absolute inset-0 rounded-full overflow-hidden ${
                      chatPartner?.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }`}
                    style={chatPartner?.pfp_background ? { backgroundImage: `url(${chatPartner.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  />
                  {/* PFP Layer */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transform-gpu">
                    {chatPartner?.pfp ? (
                      <img src={chatPartner.pfp} alt={`${chatPartner.username}'s avatar`} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-base md:text-lg font-bold text-white tracking-wide">
                        {chatPartner?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  {/* Border Layer */}
                  <div className="absolute inset-0 rounded-full border-2 border-black/20 pointer-events-none" />
                </div>
                <span className="text-sm md:text-base font-semibold text-gray-100 leading-tight">
                  {chatPartner?.username || 'Stranger'}
                </span>
              </div>
              <div className="flex justify-center items-center min-h-[92px] md:min-h-[100px] mb-5 md:mb-6">
                {icebreakerTopic ? (
                  <p className="text-lg md:text-2xl font-medium text-white leading-snug text-left whitespace-pre-line">
                    {icebreakerPrompt?.text ? icebreakerPrompt.text : formatIcebreaker(icebreakerTopic)}
                  </p>
                ) : (
                  <IcebreakerLoader />
                )}
              </div>
              {icebreakerPrompt?.kind === "mcq" && icebreakerPrompt.options?.length ? (
                <div className="flex flex-col gap-2">
                  {icebreakerPrompt.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePromptSubmit(opt)}
                      className="w-full py-3 rounded-2xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={confirmLeaveChat}
                    className="w-full py-2 rounded-full text-zinc-400 text-[10px] md:text-xs font-medium hover:bg-zinc-800/50 hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handlePromptSubmit(); }} className="relative flex flex-col gap-2 md:gap-3">
                  <textarea
                    value={promptAnswer}
                    onChange={(e) => setPromptAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePromptSubmit();
                      }
                    }}
                    placeholder="Your answer..."
                    className="w-full h-20 md:h-24 bg-zinc-900 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-[16px] md:text-sm"
                    autoFocus
                  />
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={!icebreakerTopic || !promptAnswer.trim()}
                      className="w-full py-2.5 md:py-3 rounded-full bg-blue-600 text-white font-bold text-xs md:text-sm hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-200"
                    >
                      Unlock Chat & Send
                    </button>
                    <button
                      type="button"
                      onClick={confirmLeaveChat}
                      className="w-full py-2 md:py-2.5 rounded-full text-zinc-400 text-[10px] md:text-xs font-medium hover:bg-zinc-800/50 hover:text-white transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className={`absolute bottom-10 text-zinc-500 text-sm font-medium transition-opacity duration-300 md:hidden ${isSwiping || swipeY < 0 ? 'opacity-0' : 'opacity-100'}`}>
              Swipe up to skip
            </div>
          </div>
        )}

        {/* Warning Popup */}
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl scale-100">
              <h3 className="text-base md:text-lg font-bold text-white text-center mb-2">Skip Chat?</h3>
              <p className="text-zinc-400 text-xs md:text-sm text-center mb-6 leading-relaxed">
                Are you sure you want to disconnect?
                <br/>
                <span className="text-xs text-zinc-500 hidden md:inline-block mt-2">(Press ESC to close)</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowWarning(false)} className="flex-1 py-3 md:py-3.5 rounded-2xl bg-zinc-800 text-white font-medium text-xs md:text-sm hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmLeaveChat} className="flex-1 py-3 md:py-3.5 rounded-2xl bg-white text-black font-bold text-xs md:text-sm hover:bg-gray-200 transition-colors">
                  Yes, Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block User Popup */}
        {showBlockPopup && (
          <BlockUserPopup
            username={chatPartner?.username}
            onBlock={confirmBlockUser}
            onCancel={() => setShowBlockPopup(false)}
            onReport={handleReportUser}
          />
        )}

        {/* Report Popup */}
        {showReportPopup && (
          <ReportPopup
            onCancel={() => {
              setShowReportPopup(false);
              setReportContext(null);
            }}
            onSubmit={handleReportSubmit}
            isSubmitting={isReporting}
          />
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
            key={`${partnerToReview.userId || partnerToReview.id}-${existingRating ?? 0}`}
            partner={partnerToReview}
            partnerRating={partnerRating}
            initialRating={existingRating ?? 0}
            onSubmit={handleReviewSubmit}
            onClose={() => {
              // If the user closes the review popup (e.g. by pressing Esc or a 'skip' button),
              // we treat it as skipping without a rating. This ensures the skip flow completes.
              handleReviewSubmit({});
            }}
          />
        )}

        {/* Public Profile Popup */}
        {showPublicProfile && chatPartner && (
          <PublicProfile
            targetUserId={chatPartner.userId || chatPartner.id}
            currentUserId={currentUserId}
            currentUsername={currentUsername}
            onBack={() => setShowPublicProfile(false)}
          />
        )}

        {/* Render global call UI passed from App.js */}
        {children}
      </>
    );
  }
}

export default ChatPage;