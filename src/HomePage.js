import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { api } from './api';
import TagInput from './TagInput';
import './TagInput.css';
import SignupForm from './components/SignupForm';


const INTEREST_HINTS = [
  "the best tv show in mankind's history is ... ",
  "what thought keeps you awake at 3am?",
  "a weird fact about me is ... ",
  "democarcy is ... ",
  "make a confession to a stranger ... ",
  "worst pickup line you've ever heard ... ",
];

// Super light: only re-renders every couple seconds, no per-letter updates
function FadeRotateHint({ texts = INTEREST_HINTS, intervalMs = 2600, fadeMs = 180 }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    let t1, t2;

    const tick = () => {
      setVisible(false);

      t1 = setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setVisible(true);
      }, fadeMs);

      t2 = setTimeout(tick, intervalMs);
    };

    t2 = setTimeout(tick, intervalMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [texts, intervalMs, fadeMs]);

  return (
    <span className="text-[#fefefe]/60 text-sm font-medium tracking-wide">
      <span
        className={`inline-block transition-opacity ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDuration: `${fadeMs}ms` }}
      >
        {texts[index]}
      </span>
    </span>
  );
}

function AnimatedDots() {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span>{dots}</span>;
}

const CardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

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

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

function HomePage({ socket, onChatStart, onProfileOpen, onInboxOpen, onYappingCardsOpen, onAdminOpen, currentUsername, currentUserId, initialTags = [], notification: externalNotification, onNotificationChange, globalNotifications, globalFriendRequests, setGlobalNotifications, setGlobalFriendRequests, unreadCount, setSuggestedTopic, initialQueueState, setQueueState, children }) {
  const [inQueue, setInQueue] = useState(initialQueueState?.inQueue || false);
  const [queuePosition, setQueuePosition] = useState(initialQueueState?.position || 0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Ensure you fetch this via api.getUser

  // 1. Add state for the specific prompt of this session
  const [queueTopic, setQueueTopic] = useState(null);
  const [sharing, setSharing] = useState(false);

  // ✅ 3. LISTEN TO PROP UPDATES (Crucial for race conditions)
  useEffect(() => {
    if (initialQueueState) {
      setInQueue(initialQueueState.inQueue);
      setQueuePosition(initialQueueState.position);
    }
  }, [initialQueueState]);

  useEffect(() => {
    if (currentUserId) {
        api.getUser(currentUserId).then(user => {
            setCurrentUser(user);
            if (user.banned_until && new Date(user.banned_until) > new Date()) {
                setIsBanned(true);
                setBannerMessage(`You are banned until ${new Date(user.banned_until).toLocaleString()}. Reason: ${user.reason || 'Violating community guidelines'}`);
            }
        }).catch(err => console.error("Failed to fetch user or check ban status", err));
    }
}, [currentUserId]);


  const [notification, setNotification] = useState(externalNotification || null);
  // Use global state instead of local state
  const friendRequests = globalFriendRequests;
  const notifications = globalNotifications;
  const setFriendRequests = setGlobalFriendRequests;
  const setNotifications = setGlobalNotifications;
  const [showNotifications, setShowNotifications] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);
  const bellNotifications = notifications.filter(n => n.id !== 'partner-disconnected');
  const [tags, setTags] = useState(initialTags);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pfpUrl, setPfpUrl] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  
  const handleStartChat = useCallback(async () => {
    if (!currentUserId) return;

    if (tags.length < 1) {
      setBannerMessage("Please put at least 1 interest to get paired");
      return;
    }

    // Always ensure we have a real user object (kills the race condition)
    const freshUser = currentUser?.id
      ? currentUser
      : await api.getUser(currentUserId);

    setCurrentUser(freshUser);

    // We rely on the backend to enforce limits (GUEST_LIMIT error).

    onChatStart?.();

    try {
      if (tags.length > 0) api.sendUserInterests(currentUserId, tags).catch(console.error);

      const result = await api.joinQueue(currentUserId, tags);

      if (result.error) {
        // --- FIX START ---
        // result.error is just the message string "Out of matches"
        const err = new Error(result.error);
        
        // The 'code' is at the top level of the result object, NOT inside 'error'
        if (result.code) err.code = result.code; 
        
        if (result.banned_until) err.banned_until = result.banned_until;
        if (result.reason) err.reason = result.reason;
        
        throw err;
        // --- FIX END ---
      }

      // 2. Success: Decrement local counter immediately for UI
      // We do not want to deduct matches just for waiting in line.
      /* setCurrentUser(prev => ({
        ...prev,
        matches_remaining: prev.matches_remaining > 0 ? prev.matches_remaining - 1 : 0
      }));
      */

      setQueueState({ inQueue: true, position: result.queuePosition || 1 });
      setInQueue(true);
      setQueuePosition(result.queuePosition || 1);
      setNotification(null);
      if (onNotificationChange) onNotificationChange(null);
      setBannerMessage(null);

      // Fetch a suggested topic when joining the queue
      try {
        const topicData = await api.suggestTopic(currentUserId);
        if (topicData && topicData.suggestion) {
          setSuggestedTopic(topicData.suggestion);
          setQueueTopic(topicData.suggestion); // <--- Store locally for this queue session
        }
      } catch (topicError) {
        console.error('Error fetching suggested topic:', topicError);
      }

    } catch (error) {
      console.error('❌ Error joining queue:', error);
      
      // 3. Backend Error Check (The Fix)
      // Check for both the code AND the message to be safe
      const errMsg = error.message || JSON.stringify(error);
      if (error.code === 'GUEST_LIMIT' || errMsg.includes('GUEST_LIMIT') || errMsg.includes('Out of matches')) {
          setShowUpgrade(true);
      } else if (error.banned_until || errMsg.includes('banned')) {
          setIsBanned(true);
          setBannerMessage(`You are banned until ${new Date(error.banned_until).toLocaleString()}. Reason: ${error.reason || 'Violating community guidelines'}`);
      } else {
          setBannerMessage(errMsg || 'An unexpected error occurred.');
      }
    }
  }, [currentUserId, tags, onChatStart, setQueueState, setInQueue, setQueuePosition, setNotification, onNotificationChange, setSuggestedTopic, setIsBanned, setBannerMessage, currentUser, setCurrentUser]);

  const leaveQueue = useCallback(async () => {
    try {
      //console.log('HomePage: Leaving queue for user:', currentUserId);
      await api.leaveQueue(currentUserId);
      console.log('HomePage: Successfully left queue.');
      // ✅ Update global state when leaving
      setQueueState({ inQueue: false, position: 0 });
      setInQueue(false);
      setQueuePosition(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  }, [currentUserId, setQueueState, setInQueue, setQueuePosition]);

  // 3. New Function to handle native sharing
  const handleSharePrompt = async () => {
    if (!queueTopic || !currentUserId) return;
    setSharing(true);
    
    try {
        // Generate the link
        const { shareUrl } = await api.createInvite(currentUserId, queueTopic);
        
        // Native Share Sheet
        if (navigator.share) {
            await navigator.share({
                title: 'Yap with me on blahbluh',
                text: `I want to talk about: "${queueTopic}". Click to join me!`,
                url: shareUrl
            });
        } else {
            // Fallback for desktop
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard! Send it to your bestie.');
        }
    } catch (err) {
        console.error('Share failed:', err);
    } finally {
        setSharing(false);
    }
  };

  // Ref to track queue state for unmount cleanup
  const inQueueRef = useRef(inQueue);

  useEffect(() => {
    inQueueRef.current = inQueue;
  }, [inQueue]);

  useEffect(() => {
    return () => {
      if (inQueueRef.current && currentUserId) {
        console.log('HomePage unmounting: leaving queue');
        api.leaveQueue(currentUserId).catch(err => console.error('Error leaving queue on unmount:', err));
      }
    };
  }, [currentUserId]);

  // Debug logging for notification counts
  // useEffect(() => {
  //   //console.log('NOTIFICATION DEBUG: HomePage notification counts - friendRequests:', friendRequests.length, 'notifications:', notifications.length, 'total:', friendRequests.length + notifications.length);
  // }, [friendRequests.length, notifications.length]);

  useEffect(() => {
    const checkAdmin = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && user.email) {
        const isUserAdmin = await api.checkIsAdmin(user.email);
        setIsAdmin(isUserAdmin);
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (externalNotification) {
      setNotification(externalNotification);
    }
  }, [externalNotification]);

//   useEffect(() => {
//   if (bannerMessage) return;

//   const partnerDisconnectNotif = notifications.find(
//     n => n.id === 'partner-disconnected'
//   );

//   if (!partnerDisconnectNotif) return;

//   // show banner
//   setBannerMessage(partnerDisconnectNotif.message);
//   setInQueue(true);

//   const t = setTimeout(() => {
//     setBannerMessage(null);

//     // 🔥 remove notification ONLY after banner is gone
//     setGlobalNotifications(prev =>
//       prev.filter(n => n.id !== 'partner-disconnected')
//     );
//   }, 3000);

//   return () => clearTimeout(t);
// }, [notifications, bannerMessage, setGlobalNotifications]);

  useEffect(() => {
    if (notification !== 'partner-disconnected') return;

    // Refresh user data to keep counter real
    if (currentUserId) {
      api.getUser(currentUserId).then(setCurrentUser).catch(console.error);
    }

    // show banner
    setBannerMessage('Partner disconnected. ready to go again?');

    const t = setTimeout(() => {
      setBannerMessage(null);

      // clear the transient notification
      setNotification(null);
      onNotificationChange?.(null);
    }, 3000);

    return () => clearTimeout(t);
  }, [notification, onNotificationChange, currentUserId]);

  useEffect(() => {
    if (notification !== 'partner-disconnected') return;
    if (isBanned) return;
    if (inQueue) return; // already waiting
    if (!currentUserId) return;
    if (!tags || tags.length === 0) return; // Start Chatting is disabled without tags anyway

    // slight delay so UI can breathe + banner can show
    const t = setTimeout(() => {
      handleStartChat();
    }, 300);

    return () => clearTimeout(t);
  }, [notification, isBanned, inQueue, currentUserId, tags, handleStartChat]);

  useEffect(() => {
    if (!currentUserId) return;

    let ignore = false;
    const loadPfp = async () => {
      try {
        const pfpData = await api.getUserPfp(currentUserId);
        if (!ignore && pfpData) {
          const url = pfpData.pfp || pfpData.pfpLink;
          if (url) {
            setPfpUrl(url);
          }
        }
      } catch (error) {
        // It's okay if this fails, we'll just show the default icon.
        console.log("Could not load user PFP for nav bar, showing default icon.", error.message);
      }
    };

    loadPfp();

    return () => { ignore = true; };
  }, [currentUserId]);

  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    //console.log('HomePage: Loading friend requests for user:', currentUserId);
    try {
      const requests = await api.getFriendRequests(currentUserId);
      //console.log('HomePage: Loaded friend requests:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  }, [currentUserId, setFriendRequests]);

  const handleAcceptFriend = async (requestId) => {
  if (processingRequests.has(requestId)) return;

  setProcessingRequests(prev => new Set(prev).add(requestId));
  //console.log('👍 HomePage accepting friend request:', requestId);
  //console.log('Current user accepting on HomePage:', currentUserId);

  try {
    console.log('HomePage: Calling api.acceptFriendRequest...');
    await api.acceptFriendRequest(requestId, currentUserId);

    // refresh requests UI
    console.log('HomePage: Reloading friend requests after accepting...');
    await loadFriendRequests();

    // ✅ CRITICAL: acceptor must join friend chat rooms immediately
    //console.log('HomePage: Calling api.getFriends to join chat rooms...');
    const friends = await api.getFriends(currentUserId);
    //console.log('HomePage: Got friends:', friends);
      friends.forEach((friend) => {
        const friendId = friend.userId || friend.id; // handle both shapes
        if (!friendId) return;

        const chatId = `friend_${[currentUserId, friendId].sort().join('_')}`;
        socket?.emit('join-chat', { chatId });
      });
    } catch (error) {
      console.error('❌ HomePage error accepting friend request:', error);
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (currentUserId) {
      console.log('HomePage: Setting up interval to load friend requests.');
      loadFriendRequests();
      const interval = setInterval(() => loadFriendRequests(), 5000);
      return () => {
        console.log('HomePage: Clearing interval for loading friend requests.');
        clearInterval(interval);
      };
    }
  }, [currentUserId, loadFriendRequests]);

  useEffect(() => {
    if (socket && currentUserId) {
      const handleFriendRequest = () => {
        console.log("HomePage: 'friend-request-received' socket event received. Reloading friend requests.");
        loadFriendRequests();
      };
      // Removed - now handled by App.js

      socket.on('friend-request-received', handleFriendRequest);

      return () => {
        console.log("HomePage: Cleaning up 'friend-request-received' socket listener.");
        socket.off('friend-request-received', handleFriendRequest);
      };
    }
  }, [socket, currentUserId, loadFriendRequests]);

  // Fix: Listen for backend-initiated queue joining (Fixes "Ghost Position 0")
  useEffect(() => {
    if (!socket) return;

    const handleQueueJoined = (data) => {
      //console.log('HomePage: Received queue-joined event from server:', data);
      setInQueue(true);
      // Backend uses 1-based index (queue.length), so 1 is the first spot.
      setQueuePosition(data.queuePosition || 1); 
    };

    const handleBanned = (data) => {
      //console.log('User is banned:', data);
      setInQueue(false);
      setIsBanned(true);
      setBannerMessage(`You are banned until ${new Date(data.bannedUntil).toLocaleString()}. Reason: ${data.reason}`);
    };

    socket.on('queue-joined', handleQueueJoined);
    socket.on('banned', handleBanned);

    return () => {
      socket.off('queue-joined', handleQueueJoined);
      socket.off('banned', handleBanned);
    };
  }, [socket]);

  const matches = currentUser?.matches_remaining === -1 ? 50 : (currentUser?.matches_remaining || 0);
  const maxMatches = 50;
  const matchPercentage = Math.min(100, Math.max(0, (matches / maxMatches) * 100));

  return (
    <div className="min-h-screen bg-[#000000] text-[#fefefe] flex flex-col font-sans selection:bg-[#ffbd59]/30">
      <nav className="fixed top-0 w-full z-20 bg-[#000000]/80 backdrop-blur-xl border-b border-[#fefefe]/5">
        <div className="px-4 h-16 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center">
          <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-10 h-10 object-contain rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onAdminOpen}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-xl font-bold hover:bg-red-600/40 transition-all text-xs md:text-sm"
            >
              ADMIN PANEL
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fefefe]/5 hover:bg-[#fefefe]/10 transition-colors text-[#fefefe]/80 hover:text-[#fefefe] relative"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {(friendRequests.length > 0 || bellNotifications.length > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff907c] text-black text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[#ff907c]/50">
                  {friendRequests.length + bellNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (friendRequests.length > 0 || bellNotifications.length > 0) && (
              <div className="fixed right-4 left-4 top-16 md:absolute md:top-10 md:right-0 md:left-auto md:w-80 bg-[#000000]/95 backdrop-blur-md border border-[#fefefe]/10 rounded-xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                {friendRequests.length > 0 && (
                  <>
                    <h3 className="text-[#fefefe] font-bold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#ff907c] rounded-full animate-pulse"></span>
                      Friend Requests
                    </h3>
                    <div className="space-y-3 mb-4">
                      {friendRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-[#fefefe]/5 rounded-lg border-l-4 border-[#ffbd59]">
                          <div>
                            <p className="text-[#fefefe] text-sm font-medium">{request.from_user.username} sent you a friend request</p>
                            <p className="text-[#fefefe]/60 text-xs">Click accept to add them as a friend</p>
                          </div>
                          <button
                            onClick={() => handleAcceptFriend(request.id)}
                            disabled={processingRequests.has(request.id)}
                            className={`px-3 py-1 text-black text-xs rounded-lg transition-colors shadow-lg ${
                              processingRequests.has(request.id) 
                                ? 'bg-[#ffbd59]/50 cursor-not-allowed opacity-70' 
                                : 'bg-[#ffbd59] hover:bg-[#ffbd59]/80'
                            }`}
                          >
                            {processingRequests.has(request.id) ? 'Accepting...' : 'Accept'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {bellNotifications.length > 0 && (
                  <>
                    <h3 className="text-[#fefefe] font-bold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#ffbd59] rounded-full animate-pulse"></span>
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {bellNotifications.map(notification => (
                        <div key={notification.id} className="flex items-center justify-between p-3 bg-[#fefefe]/5 rounded-lg border-l-4 border-[#ffbd59]">
                          <div>
                            <p className="text-[#fefefe] text-sm font-medium">🎉 {notification.message}</p>
                            <p className="text-[#fefefe]/60 text-xs">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                            className="px-2 py-1 text-[#fefefe]/60 hover:text-[#fefefe] text-xs transition-colors"
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
            onClick={onYappingCardsOpen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fefefe]/5 hover:bg-[#fefefe]/10 transition-colors text-[#fefefe]/80 hover:text-[#fefefe]"
            title="My Yaps"
          >
            <CardsIcon />
          </button>
          <button
            onClick={() => {
              if (isBanned) {
                setBannerMessage("You cannot access inbox while banned.");
                return;
              }
              onInboxOpen();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative ${isBanned ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed' : 'bg-[#fefefe]/5 hover:bg-[#fefefe]/10 text-[#fefefe]/80 hover:text-[#fefefe]'}`}
          >
            <InboxIcon />
            {!isBanned && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff907c] text-black text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onProfileOpen}
            className="w-10 h-10 rounded-full overflow-hidden border border-[#fefefe]/10 hover:border-[#fefefe]/30 transition-all"
          >
            {pfpUrl ? (
              <img src={pfpUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#fefefe]/10 flex items-center justify-center text-[#fefefe]/60">
                <UserIcon />
              </div>
            )}
          </button>
        </div>
        </div>
        <div className="w-full h-[2px] bg-[#fefefe]/5">
            <div
                className="h-full bg-[#ffbd59] shadow-[0_0_10px_#ffbd59] transition-all duration-1000 ease-out"
                style={{ width: `${matchPercentage}%` }}
            />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 relative overflow-y-auto overflow-x-hidden pt-24 pb-10 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[0.5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#fefefe]/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#fefefe]/20">

        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffbd59]/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#ff907c]/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-md w-full text-center relative z-10 mt-8 md:my-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#fefefe] mb-4">
            Yap with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffbd59] via-[#ffbd59] to-[#ff907c]">
              Randos.
            </span>
          </h1>
          
          <div className="mb-6 text-left">
            <div className="mb-2 ml-1 h-6 flex items-center">
               <FadeRotateHint />
            </div>
            <TagInput tags={tags} onTagsChange={(newTags) => {
              setTags(newTags);
              if (newTags.length >= 1) setBannerMessage(null);
            }} />
          </div>
          {bannerMessage && (
            <div className="px-4 py-3 mb-4 rounded-2xl bg-[#ff907c]/10 border border-[#ff907c]/20 text-[#ff907c] text-sm animate-in fade-in">
              {bannerMessage}
            </div>
          )}


          {inQueue ? (
            <div className="w-full bg-[#000000]/80 backdrop-blur-xl border border-[#fefefe]/10 p-6 md:p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center gap-6">
                
                {/* Spinner & Position */}
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full border-2 border-t-[#ffbd59] border-[#fefefe]/10 animate-spin mb-4"></div>
                   <h3 className="text-xl font-bold text-[#fefefe]">Finding a match<AnimatedDots /></h3>
                   <p className="text-[#fefefe]/60 text-sm">Position in queue: <span className="text-[#fefefe] font-mono">{queuePosition}</span></p>
                </div>

                {/* The Prompt Card */}
                {queueTopic && (
                    <div className="w-full bg-[#fefefe]/5 rounded-2xl p-5 border border-[#fefefe]/10 relative group">
                        <div className="absolute -top-3 left-4 bg-[#ffbd59] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                            YOUR PROMPT
                        </div>
                        <p className="text-lg text-center font-medium text-[#fefefe]/90 my-2">
                            "{queueTopic}"
                        </p>
                        
                        {/* Share Button */}
                        <button 
                          onClick={handleSharePrompt}
                          disabled={sharing}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#fefefe]/10 hover:bg-[#fefefe]/20 transition-all text-sm font-bold text-[#ffbd59]"
                        >
                          {sharing ? (
                              <span>Generating Link...</span>
                          ) : (
                              <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                  Send to Bestie instead
                              </>
                          )}
                        </button>
                    </div>
                )}

                <button
                  onClick={leaveQueue}
                  className="text-[#fefefe]/40 text-xs hover:text-[#fefefe] transition-colors"
                >
                  Cancel & Leave Queue
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* {notification === 'partner-disconnected' && (
                <div className="px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm mb-2">
                  Partner disconnected. ready to go again?
                </div>
              )} */}
              
              <button 
                onClick={handleStartChat} 
                disabled={isBanned}
                className={`group relative w-full py-3.5 rounded-full bg-[#ffbd59] text-black text-lg font-bold transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,189,89,0.4)] ${isBanned ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_0_30px_-5px_rgba(255,189,89,0.6)]'}`}
              >
                Start Yapping
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="py-6 text-center text-[#fefefe]/40 text-xs font-medium">
        &copy; 2025 blahbluh. Crafted for anonymity.
      </div>

      {/* Contact / Help Button */}
      <a
        href="mailto:hello@blahbluh.com"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-lg"
        aria-label="Contact Support"
      >
        <HelpIcon />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs font-medium text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap shadow-xl">
          hello@blahbluh.com
        </span>
      </a>

       {/* 2. Upgrade Modal */}
       {showUpgrade && (
         <SignupForm 
           isUpgrade={true} 
           loading={false}
           onComplete={async (formData) => {
              if (!formData) { setShowUpgrade(false); return; } // User clicked "Remind me later"
              
              // 1. Send profile data to backend
              // Backend will detect completion -> Set is_guest=false, matches=50
              await api.updateUser(currentUserId, formData);
              
              // 2. Fetch the FRESH user data immediately
              const updated = await api.getUser(currentUserId);
              
              // 3. Update State
              // Now currentUser.matches_remaining is 50, so handleStartChat works!
              setCurrentUser(updated);
              setShowUpgrade(false);
           }} 
         />
       )}

      {/* Global Call UI */}
      {children}
    </div>
  );
}

export default HomePage;
