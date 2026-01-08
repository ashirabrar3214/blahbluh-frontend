import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import TagInput from './TagInput';
import './TagInput.css';

const INTEREST_HINTS = [
  "the best tv show in mankind's history is ... ",
  "what thought keeps you awake at 3am?",
  "a weird fact about me is ... ",
  "democarcy is ... ",
  "make a confession to a stranger ... ",
  "worst picku line you've ever heard ... ",
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

function HomePage({ socket, onChatStart, onProfileOpen, onInboxOpen, currentUsername, currentUserId, initialTags = [], notification: externalNotification, onNotificationChange, globalNotifications, globalFriendRequests, setGlobalNotifications, setGlobalFriendRequests, unreadCount, setSuggestedTopic }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
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
  const [pfpUrl, setPfpUrl] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  
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
  useEffect(() => {
    console.log('NOTIFICATION DEBUG: HomePage notification counts - friendRequests:', friendRequests.length, 'notifications:', notifications.length, 'total:', friendRequests.length + notifications.length);
  }, [friendRequests.length, notifications.length]);

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

    // show banner
    setBannerMessage('Partner disconnected. ready to go again?');

    // user is already queued after disconnect
    setInQueue(true);

    const t = setTimeout(() => {
      setBannerMessage(null);

      // clear the transient notification
      setNotification(null);
      onNotificationChange?.(null);
    }, 3000);

    return () => clearTimeout(t);
  }, [notification, onNotificationChange]);

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
    console.log('HomePage: Loading friend requests for user:', currentUserId);
    try {
      const requests = await api.getFriendRequests(currentUserId);
      console.log('HomePage: Loaded friend requests:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  }, [currentUserId, setFriendRequests]);

  const handleAcceptFriend = async (requestId) => {
  if (processingRequests.has(requestId)) return;

  setProcessingRequests(prev => new Set(prev).add(requestId));
  console.log('👍 HomePage accepting friend request:', requestId);
  console.log('Current user accepting on HomePage:', currentUserId);

  try {
    console.log('HomePage: Calling api.acceptFriendRequest...');
    const result = await api.acceptFriendRequest(requestId, currentUserId);
    console.log('✅ HomePage accept friend API response:', result);

    // refresh requests UI
    console.log('HomePage: Reloading friend requests after accepting...');
    await loadFriendRequests();

    // ✅ CRITICAL: acceptor must join friend chat rooms immediately
    console.log('HomePage: Calling api.getFriends to join chat rooms...');
    const friends = await api.getFriends(currentUserId);
    console.log('HomePage: Got friends:', friends);
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
      console.log('HomePage: Received queue-joined event from server:', data);
      setInQueue(true);
      // Backend uses 1-based index (queue.length), so 1 is the first spot.
      setQueuePosition(data.queuePosition || 1); 
    };

    socket.on('queue-joined', handleQueueJoined);

    return () => {
      socket.off('queue-joined', handleQueueJoined);
    };
  }, [socket]);

  const joinQueue = async () => {
    if (!currentUserId) {
      console.log('HomePage: joinQueue attempted without currentUserId.');
      return;
    }

    // IMPORTANT: if user previously hit Home/Exit from chat,
    // App.js may still be ignoring chat-paired. Clear that now.
    onChatStart?.();

    try {
      // Send interests to the backend for logging/analytics
      if (tags.length > 0) {
        api.sendUserInterests(currentUserId, tags).catch(console.error);
      }

      console.log('🚀 Joining queue for user:', currentUserId);
      console.log('Tags:', tags);
      const result = await api.joinQueue(currentUserId, tags);
      console.log('✅ Queue join result:', result);
      setInQueue(true);
      setQueuePosition(result.queuePosition ?? 0);
      setNotification(null);
      if (onNotificationChange) onNotificationChange(null);

      // Fetch a suggested topic when joining the queue
      try {
        const topicData = await api.suggestTopic(currentUserId);
        if (topicData && topicData.suggestion) {
          // We'll use a global notification to pass this to the ChatPage
          setSuggestedTopic(topicData.suggestion);
        }
      } catch (topicError) {
        console.error('Error fetching suggested topic:', topicError);
        // Don't block user from chatting if topic suggestion fails
      }
    } catch (error) {
      console.error('❌ Error joining queue:', error);
    }
  };

  const leaveQueue = async () => {
    try {
      console.log('HomePage: Leaving queue for user:', currentUserId);
      await api.leaveQueue(currentUserId);
      console.log('HomePage: Successfully left queue.');
      setInQueue(false);
      setQueuePosition(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#fefefe] flex flex-col font-sans selection:bg-[#ffbd59]/30">
      <nav className="fixed top-0 w-full z-20 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center bg-[#000000]/50 backdrop-blur-md border-b border-[#fefefe]/5">
        <div className="flex items-center gap-2 md:gap-2.5">
          <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-[18%]" />
          <span className="font-bold text-base md:text-lg tracking-tight text-[#fefefe]">blahbluh</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#fefefe]/5 border border-[#fefefe]/10 text-[#fefefe]/60 hover:bg-[#fefefe]/10 hover:text-[#fefefe] transition-colors relative"
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
              <div className="absolute top-10 right-0 w-80 bg-[#000000]/95 backdrop-blur-md border border-[#fefefe]/10 rounded-xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
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
            onClick={onInboxOpen}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#fefefe]/5 border border-[#fefefe]/10 text-[#fefefe]/60 hover:bg-[#fefefe]/10 hover:text-[#fefefe] transition-colors relative"
          >
            <InboxIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff907c] text-black text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onProfileOpen}
            className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 rounded-full bg-[#fefefe]/5 border border-[#fefefe]/10 text-[10px] md:text-xs text-[#fefefe]/60 font-mono hover:bg-[#fefefe]/10 hover:text-[#fefefe] transition-colors"
          >
            {pfpUrl ? (
              <img src={pfpUrl} alt="Profile" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-contain bg-[#fefefe]/10" />
            ) : (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#fefefe]/10 flex items-center justify-center">
                <UserIcon />
              </div>
            )}
            {currentUsername || 'guest'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 relative overflow-y-auto overflow-x-hidden pt-20 pb-10 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[0.5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#fefefe]/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#fefefe]/20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffbd59]/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#ff907c]/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="absolute inset-0 flex items-start md:items-center justify-center pointer-events-none z-0 pt-24 md:pt-0">
          <img 
            src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/earthimage.png" 
            alt="" 
            className="w-[80%] max-w-[600px] object-contain opacity-40"
            style={{ filter: 'invert(89%) sepia(16%) saturate(1684%) hue-rotate(328deg) brightness(103%) contrast(101%) drop-shadow(0 0 8px #ffbd59)' }}
          />
        </div>

        <div className="max-w-lg w-full text-center relative z-10 mt-12 md:my-auto">
          <h1 className="text-6xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-[#fefefe] mb-6">
            Yap with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffbd59] via-[#ffbd59] to-[#ff907c]">
              Randos.
            </span>
          </h1>
          
          {/* <p className="text-lg text-[#fefefe]/60 mb-12 max-w-md mx-auto leading-relaxed">
            Instant anonymous connections. No login required. Just pure conversation.
          </p> */}
          <div className="mb-8 text-left">
            <div className="mb-2 ml-1 h-6 flex items-center">
               <FadeRotateHint />
            </div>
            <TagInput tags={tags} onTagsChange={setTags} />
          </div>
          {bannerMessage && (
            <div className="px-4 py-3 mb-4 rounded-2xl bg-[#ff907c]/10 border border-[#ff907c]/20 text-[#ff907c] text-sm animate-in fade-in">
              {bannerMessage}
            </div>
          )}


          {inQueue ? (
            <div className="w-full bg-[#000000]/80 backdrop-blur-xl border border-[#fefefe]/10 p-6 md:p-8 rounded-[32px] shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-t-[#ffbd59] border-[#fefefe]/10 animate-spin"></div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#fefefe] mb-1">Finding a match<AnimatedDots /></h3>
                  <p className="text-[#fefefe]/60 text-sm">Position in queue: <span className="text-[#fefefe] font-mono">{queuePosition}</span></p>
                </div>
                <button
                  onClick={leaveQueue}
                  className="mt-4 px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-[#fefefe]/10 text-[#fefefe] text-xs md:text-sm font-medium hover:bg-[#fefefe]/20 transition-colors"
                >
                  Cancel
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
                onClick={joinQueue} 
                disabled={tags.length === 0}
                className={`group relative w-full py-4 md:py-5 rounded-full bg-[#ffbd59] text-black text-base md:text-lg font-bold transition-all duration-200 shadow-[0_0_40px_-10px_rgba(255,189,89,0.3)] ${tags.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                Start Chatting
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="py-6 text-center text-[#fefefe]/40 text-xs font-medium">
        &copy; 2025 blahbluh. Crafted for anonymity.
      </div>
    </div>
  );
}

export default HomePage;
