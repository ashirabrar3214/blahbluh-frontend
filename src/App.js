import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatPage from './ChatPage';
import FireChatPage from './FireChatPage';
import HomePage from './HomePage';
import InboxPage from './InboxPage';
import ProfilePage from './ProfilePage';
import SignupForm from './components/SignupForm';
import { api } from './api';
import InvitePage from './InvitePage';
import LoadingScreen from './components/LoadingScreen';
import CallPopup from './components/CallPopup';
import AdminDashboard from './AdminDashboard';
import YappingCardsPage from './YappingCardsPage';

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const normalizeChatId = (id) => {
  if (!id) return id;
  if (!id.startsWith('friend_')) return id;

  const parts = id.split('_'); // ["friend", id1, id2]
  if (parts.length < 3) return id;

  const a = parts[1];
  const b = parts[2];
  return `friend_${[a, b].sort().join('_')}`;
};

// This wrapper decides which page to show based on the URL ID
const ChatRouteDispatcher = (props) => {
  const { chatId } = useParams();
  const isFirechat = chatId?.startsWith('yap_');

  const chatProps = {
    ...props,
    initialChatData: { chatId },
    // Ensure the full user object is available
    user: props.user 
  };

  if (isFirechat) {
    return <FireChatPage {...chatProps} />;
  }
  return <ChatPage {...chatProps} />;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bannedInfo, setBannedInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState('loading');
  const [inboxKey, setInboxKey] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [pageNotification, setPageNotification] = useState(null);
  const [suggestedTopic, setSuggestedTopic] = useState(null);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [globalFriendRequests, setGlobalFriendRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [queueState, setQueueState] = useState({ inQueue: false, position: 0 });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // ✅ Global Modal State
  const globalSocketRef = useRef(null);
  const currentPageRef = useRef(currentPage);
  const chatExitRef = useRef(false);
  const navigate = useNavigate();

  // --- WebRTC STATE (Global) ---
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'calling', 'incoming', 'connected'
  const [callPartner, setCallPartner] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const activeChatIdRef = useRef(null); // Track which chat the call belongs to
  const iceCandidatesBuffer = useRef([]); // ✅ Buffer for early ICE candidates

  const handleApiError = useCallback((error) => {
    if (error?.message?.includes('403') || error?.message?.includes('suspended')) {
      setBannedInfo({ reason: "Your account has been suspended." });
      setCurrentPage('banned');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const restoreUser = async () => {
      const userId = localStorage.getItem('blahbluh_userId');
      if (userId) {
        try {
          const user = await api.getUser(userId);
          if (user && user.id) {
            setCurrentUser(user);
            setCurrentPage('home');
          } else {
            localStorage.removeItem('blahbluh_userId');
            setCurrentPage('signup');
          }
        } catch (error) {
          console.error('Failed to restore user, going to signup', error);
          if (handleApiError(error)) return;
          localStorage.removeItem('blahbluh_userId');
          setCurrentPage('signup');
        }
      } else {
        setCurrentPage('signup');
      }
    };

    restoreUser();
  }, [handleApiError]);

  // Handle pending invites from localStorage
  useEffect(() => {
    const checkPendingInvite = async () => {
      const pendingToken = localStorage.getItem('pending_invite_token');
      const pendingAnswer = localStorage.getItem('pending_invite_answer');
      
      if (pendingToken && currentUser?.id) {
          console.log("Found pending invite, accepting...");
          try {
              const result = await api.acceptInvite(pendingToken, currentUser.id, pendingAnswer);
              if (result.success) {
                  localStorage.removeItem('pending_invite_token'); 
                  localStorage.removeItem('pending_invite_answer');
                  
                  // FIX: Use the roomId from the result (yap_...), NOT a friend_ ID
                  setChatData({
                    chatId: result.roomId,
                    users: [] // ChatPage will fetch details
                  });
                  setCurrentPage('chat');
              }
          } catch (err) {
              console.error("Failed to accept pending invite", err);
              // DO NOT remove yet; let the user try again or fix the connection
          }
      }
    };
    
    checkPendingInvite();
  }, [currentUser]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const emitUnload = () => {
      const socket = globalSocketRef.current;
      if (!socket || !currentUser?.id) return;
      socket.emit('page-unload', { userId: currentUser.id });
    };

    // Desktop
    window.addEventListener('beforeunload', emitUnload);

    // Mobile safari/phones: MUCH more reliable
    window.addEventListener('pagehide', emitUnload);

    // Extra paranoia: if tab goes hidden, mark it (optional)
    const onVis = () => {
      if (document.visibilityState === 'hidden') emitUnload();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('beforeunload', emitUnload);
      window.removeEventListener('pagehide', emitUnload);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [currentUser]);

useEffect(() => {
  if (!chatData) return;

  // Just go to chat. ChatPage will generate prompts per chatId.
  setSelectedFriend(null);
  setCurrentPage('chat');
}, [chatData]);

    // Load initial unread count when user is set
  useEffect(() => {
    if (!currentUser) return;
    
    const loadInitialUnreadCount = async () => {
      console.log('App: Loading initial unread count for user:', currentUser.id);
      try {
        console.log('App: Calling api.getFriends for unread count calculation.');
        const friends = await api.getFriends(currentUser.id);
        console.log('App: Got friends for unread count:', friends);
        let totalUnread = 0;
        for (const friend of friends) {
          const friendId = friend.userId || friend.id;
          try {
            console.log(`App: Calling api.getUnreadCount for friend: ${friendId}`);
            const count = await api.getUnreadCount(currentUser.id, friendId);
            totalUnread += count;
          } catch (error) {
            console.error('Error getting unread count:', error);
          }
        }
        console.log(' App: Initial total unread count:', totalUnread);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error loading initial unread count:', error);
      }
    };
    
    loadInitialUnreadCount();
  }, [currentUser]);

  // --- WebRTC FUNCTIONS ---
  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    iceCandidatesBuffer.current = []; // ✅ Clear buffer
    setIsMuted(false);
    setCallStatus('idle');
    setIncomingOffer(null);
    setCallPartner(null);
    activeChatIdRef.current = null;
  }, []);

  const startCall = async (chatId, partner) => {
    const normChatId = normalizeChatId(chatId);
    setCallStatus('calling');
    setCallPartner(partner);
    activeChatIdRef.current = normChatId;
    iceCandidatesBuffer.current = []; // ✅ Clear buffer on start
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone not accessible");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          globalSocketRef.current?.emit('ice-candidate', { chatId: normChatId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];

          // ✅ Some browsers won't autoplay without an explicit play()
          const p = remoteAudioRef.current.play?.();
          if (p && typeof p.catch === "function") p.catch(() => {});
        }
      };

      peerConnectionRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      globalSocketRef.current?.emit('call-offer', {
        chatId: normChatId,
        offer,
        fromUserId: currentUser?.id, // ✅ prevents Unknown caller UI
      });
    } catch (err) {
      console.error('Error starting call:', err);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingOffer || !activeChatIdRef.current) return;
    const chatId = normalizeChatId(activeChatIdRef.current);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone not accessible");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          globalSocketRef.current?.emit('ice-candidate', { chatId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];

          // ✅ Some browsers won't autoplay without an explicit play()
          const p = remoteAudioRef.current.play?.();
          if (p && typeof p.catch === "function") p.catch(() => {});
        }
      };

      peerConnectionRef.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // ✅ Replay buffered candidates
      while (iceCandidatesBuffer.current.length > 0) {
        const candidate = iceCandidatesBuffer.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added buffered ICE candidate');
        } catch (e) {
          console.error('Error adding buffered ICE candidate:', e);
        }
      }

      globalSocketRef.current?.emit('call-answer', { chatId, answer });
      setCallStatus('connected');
    } catch (err) {
      console.error('Error accepting call:', err);
      cleanupCall();
    }
  };

  const hangupCall = () => {
    if (activeChatIdRef.current) {
      const chatId = normalizeChatId(activeChatIdRef.current);
      globalSocketRef.current?.emit('call-hangup', { chatId });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Auto-remove popup after 1 minute if stuck in calling/incoming
  useEffect(() => {
    let timeout;
    if (callStatus === 'calling' || callStatus === 'incoming') {
      timeout = setTimeout(() => {
        console.log('Call timed out, cleaning up');
        cleanupCall();
      }, 60000); // 1 minute
    }
    return () => clearTimeout(timeout);
  }, [callStatus, cleanupCall]);

  useEffect(() => {
    if (!currentUser) return;

    console.log('App: Setting up global socket connection for user:', currentUser.id);
    // Setup global socket connection
    globalSocketRef.current = io(
    process.env.REACT_APP_API_URL || 'http://localhost:3000',
    {
      transports: ['websocket'],
      reconnection: true,
    }
  );

    // Background presence for friend chats
    const setupFriendPresence = async () => {
      console.log('App: Setting up friend presence for user:', currentUser.id);
      try {
        console.log('App: Calling api.getFriends for friend presence setup.');
        const friends = await api.getFriends(currentUser.id);
        console.log('App: Got friends for presence:', friends);
        friends.forEach(friend => {
          const friendId = friend.userId || friend.id;
          if (!friendId) return;

          const chatId = `friend_${[currentUser.id, friendId].sort().join('_')}`;
          console.log(`App: Emitting 'join-chat' for friend chat: ${chatId}`);
          globalSocketRef.current.emit('join-chat', { chatId });
        });
      } catch (error) {
        console.error('Error setting up friend presence:', error);
      }
    };

    globalSocketRef.current.on('connect', () => {
      console.log('Global socket connected');
      console.log('App: Emitting "register-user" for user:', currentUser.id);
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
      // Fetch unread messages on connect
      console.log('App: Emitting "fetch-unread-messages" for user:', currentUser.id);
      globalSocketRef.current.emit('fetch-unread-messages', { userId: currentUser.id });
      
      // Re-join friend rooms on reconnect
      setupFriendPresence();
    });

    // Listen for queue-joined globally
    globalSocketRef.current.on('queue-joined', (data) => {
      console.log('Global: User joined queue', data);
      setQueueState({ inQueue: true, position: data.queuePosition || 1 });
    });

    // UPDATE THIS LISTENER: Clear queue state when matched
    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('Chat paired globally:', data);
      
      // Always stop the queue spinner
      setQueueState({ inQueue: false, position: 0 });

      // ✅ SMART RESTORE LOGIC
      setChatData(currentChatData => {
        // 1. If we are already in this chat (e.g., Phone wake up),
        // don't overwrite the state. This preserves message history.
        if (currentChatData && currentChatData.chatId === data.chatId) {
          console.log('App: Already in this chat, ignoring redundant pair event.');
          return currentChatData;
        }
        
        // 2. If we are NOT in this chat (e.g., Page Refresh or New Match),
        // accept the data. This mounts the ChatPage.
        console.log('App: Setting new chat data (Match or Restore).');
        return data;
      });
    });

    setupFriendPresence();

    // Listen for friend request acceptance globally
    globalSocketRef.current.on('friend-request-accepted', (data) => {
      console.log('SOCKET DEBUG: Friend request accepted event received in App.js');
      const notification = {
        id: Date.now(),
        type: 'friend-accepted',
        message: data?.message || 'Your friend request was accepted!',
        timestamp: new Date().toISOString()
      };
      console.log('App: Adding global notification for friend request acceptance:', notification);
      setGlobalNotifications(prev => [notification, ...prev]);
      setInboxKey(prev => prev + 1);
      console.log('App: Re-running setupFriendPresence after friend request acceptance.');
      setupFriendPresence();
    });

    // Listen for friend messages to increment unread count
    // globalSocketRef.current.on('friend-message-received', (messageData) => {
    //   console.log('SOCKET DEBUG: Friend message received - incrementing unread count');
    //   if (currentPage !== 'friend-chat' && currentPage !== 'chat') {
    //     setUnreadCount(prev => prev + 1);
    //   }
    // });
    globalSocketRef.current.on('new-message', (messageData) => {
      // Allow BOTH 'friend_' and 'yap_' prefixes
      const isFireChat = messageData?.chatId?.startsWith('yap_');
      const isFriendChat = messageData?.chatId?.startsWith('friend_');
      
      if (!isFireChat && !isFriendChat) return;

      // Do not count messages sent by yourself
      if (messageData?.userId === currentUser.id) return;

      // Use window.location to check if we are currently looking at THIS specific chat
      const currentPath = window.location.pathname;
      const isViewingThisChat = currentPath.includes(messageData.chatId);

      // Only increment unread count if we ARE NOT actively viewing this chat
      if (!isViewingThisChat) {
        setUnreadCount(prev => prev + 1);
      }
    });
  
    globalSocketRef.current.on('partner-disconnected', () => {
      console.log('Partner disconnected globally');

      // Always trigger the banner on the real HomePage
      setPageNotification('partner-disconnected');

      // If we are in chat, force navigation back to the real home UI
      if (currentPageRef.current === 'chat') {
        setSelectedFriend(null);
        setChatData(null);
        setCurrentPage('home');
      }

      // If we're already on home, HomePage will show the banner automatically.
    });

    // ✅ GLOBAL LISTENER: Trigger Profile Popup on Match Error
    globalSocketRef.current.on('match-error', (data) => {
      console.log('App: Match limit reached', data);
      
      // 1. Only show Upgrade Modal if they are a GUEST
      if (data.code === 'GUEST_LIMIT') {
         setShowUpgradeModal(true);
      } else {
         // 2. If it's DAILY_LIMIT (User has completed profile), DO NOT show the popup.
         // You can optionally add a simple toast here if you want, 
         // but simply doing nothing fulfills "only show how many matches left".
         console.log("Daily limit reached. Suppressing popup.");
      }
    });

    // --- Global WebRTC Listeners ---
    
    // ✅ Updated call-offer to be non-blocking
    globalSocketRef.current.on('call-offer', ({ offer, fromUserId, chatId }) => {
      if (callStatus !== 'idle') {
        console.log('Busy, rejecting offer');
        globalSocketRef.current?.emit('call-hangup', { chatId }); 
        return;
      }
      console.log('Incoming call offer from:', fromUserId);
      
      const normChatId = normalizeChatId(chatId);
      activeChatIdRef.current = normChatId;
      setIncomingOffer(offer);
      setCallStatus('incoming');
      iceCandidatesBuffer.current = []; // Reset buffer

      // Initial placeholder to prevent blocking
      setCallPartner({ username: 'Incoming...' });

      // Fetch user details in background
      api.getUser(fromUserId)
        .then(async (caller) => {
            if (caller) {
              try {
                const pfpData = await api.getUserPfp(fromUserId).catch(() => null);
                if (pfpData) {
                  caller.pfp = pfpData.pfp || pfpData.pfpLink;
                  caller.pfp_background = pfpData.pfp_background;
                }
              } catch (e) {
                console.warn('Failed to load PFP for caller', e);
              }
              // Only update if we are still ringing for this user
              if (activeChatIdRef.current === normChatId) {
                setCallPartner(caller);
              }
            }
        })
        .catch((e) => {
          console.error('Failed to fetch caller info', e);
          if (activeChatIdRef.current === normChatId) {
            setCallPartner({ username: 'Unknown' });
          }
        });
    });

    globalSocketRef.current.on('call-answer', async ({ answer }) => {
      console.log('Received call answer');
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
      }
    });

    // ✅ Updated ice-candidate to buffer if PC is not ready
    globalSocketRef.current.on('ice-candidate', async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      } else {
        console.log('Buffering ICE candidate (PC not ready)');
        iceCandidatesBuffer.current.push(candidate);
      }
    });

    globalSocketRef.current.on('call-hangup', () => {
      console.log('Call hung up by peer');
      cleanupCall();
    });


    return () => {
      console.log('App: Disconnecting global socket for user:', currentUser.id);
      globalSocketRef.current?.disconnect();
    };
  }, [currentUser, callStatus, cleanupCall]);

  const handleSignupComplete = async (data) => {
    console.log('App: handleSignupComplete called with data:', data);
    setLoading(true);
    try {
      let user;
      const { userId } = data; // This is the Supabase UUID

      if (!userId) {
        throw new Error('Login/Signup failed: Supabase user ID not generated.');
      }

      if (data.isLogin) {
        // Login flow: Fetch existing user
        user = await api.getUser(userId);
      } else {
        // Signup flow: Create/Update user
        user = await api.updateUser(userId, data);
      }

      // On any successful auth, store the Supabase ID and set the user
      localStorage.setItem('blahbluh_userId', userId);
      setCurrentUser(user);
      setCurrentPage('home');
    } catch (e) {
      console.error('Failed to complete signup/login:', e);
      if (handleApiError(e)) {
        setLoading(false);
        return;
      }
      localStorage.removeItem('blahbluh_userId');
      setCurrentPage('signup');
    }
    setLoading(false);
  };

  const handleGoHome = useCallback(() => {
    console.log('App: Navigating to home page from chat.');
    chatExitRef.current = true;
    setSelectedFriend(null);
    setChatData(null);
    setPageNotification(null);
    setSuggestedTopic(null);
    setCurrentPage('home');
    navigate('/');
  }, [navigate]);

  // 🔥 GLOBAL SIGNUP GATE
  if (currentPage === 'loading') {
    return <LoadingScreen message="Loading..." />;
  }

  if (currentPage === 'banned') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-red-900/20">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Account Suspended</h1>
          <p className="text-zinc-300 mb-6">{bannedInfo?.reason || "You have been banned for violating community guidelines."}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // --- Global Call UI ---
  const renderCallUI = () => (
    <>
      {/* Incoming Call Modal (Centered) */}
      {callStatus === 'incoming' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 w-80">
            <div className="relative w-24 h-24 rounded-full shadow-xl mb-2 animate-bounce">
               {/* Background Layer */}
               <div 
                  className={`absolute inset-0 rounded-full overflow-hidden ${
                    callPartner?.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}
                  style={callPartner?.pfp_background ? { backgroundImage: `url(${callPartner.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />
                {/* PFP Layer */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                  {callPartner?.pfp ? (
                    <img src={callPartner.pfp} alt={callPartner.username} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {callPartner?.username?.[0]?.toUpperCase() || <PhoneIcon />}
                    </span>
                  )}
                </div>
                {/* Border Layer */}
                <div className="absolute inset-0 rounded-full border-2 border-white/10 pointer-events-none" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{callPartner?.username || 'Unknown'}</h3>
              <p className="text-zinc-400">Incoming call...</p>
            </div>
            <div className="flex gap-4 w-full mt-2">
              <button onClick={hangupCall} className="flex-1 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">Decline</button>
              <button onClick={acceptCall} className="flex-1 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors">Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Active/Calling Popup (Corner) */}
      {(callStatus === 'connected' || callStatus === 'calling') && (
        <CallPopup partner={callPartner} status={callStatus} onHangup={hangupCall} isMuted={isMuted} onToggleMute={toggleMute} />
      )}
      <audio ref={remoteAudioRef} autoPlay />

      {/* ✅ RENDER GLOBAL UPGRADE MODAL */}
      {showUpgradeModal && (
        <SignupForm 
          isUpgrade={true} 
          loading={false}
          onComplete={async (formData) => {
             if (!formData) { setShowUpgradeModal(false); return; }
             
             // 1. Update User
             await api.updateUser(currentUser.id, formData);
             
             // 2. Refresh Local User Data (to get 50 matches)
             const updated = await api.getUser(currentUser.id);
             setCurrentUser(updated);
             
             setShowUpgradeModal(false);
          }} 
        />
      )}
    </>
  );

  return (
      <Routes>
        <Route path="/invite/:token" element={<InvitePage currentUserId={currentUser?.id} />} />
        {/* Add this explicit route if you want proper browser history support */}
        <Route path="/chat/:chatId" element={
            currentUser ? (
               <ChatRouteDispatcher 
                  socket={globalSocketRef.current}
                  user={currentUser}
                  currentUserId={currentUser.id}
                  currentUsername={currentUser.username}
                  // Pass all standard ChatPage props here so the dispatcher can forward them
                  targetFriend={selectedFriend}
                  suggestedTopic={suggestedTopic}
                  setSuggestedTopic={setSuggestedTopic}
                  globalNotifications={globalNotifications}
                  globalFriendRequests={globalFriendRequests}
                  setGlobalNotifications={setGlobalNotifications}
                  setGlobalFriendRequests={setGlobalFriendRequests}
                  unreadCount={unreadCount}
                  callStatus={callStatus}
                  onStartCall={(chatId, partner) => startCall(chatId, partner)}
                  onHangupCall={hangupCall}
                  onGoHome={handleGoHome}
                  onInboxOpen={() => {
                    setUnreadCount(0);
                    setInboxKey(prev => prev + 1);
                    setCurrentPage('inbox');
                  }}
                  children={renderCallUI()}
               />
            ) : <SignupForm onComplete={handleSignupComplete} loading={loading} />
        } />
        <Route path="*" element={
          !currentUser ? (
            <>
              {loading && <LoadingScreen message="Creating your account..." />}
              <SignupForm
                onComplete={handleSignupComplete}
                loading={loading}
              />
            </>
          ) : (
            <>
              {currentPage === 'admin' ? (
                <AdminDashboard onBack={() => setCurrentPage('home')} />
              ) : currentPage === 'yapping-cards' ? (
                <YappingCardsPage 
                  currentUserId={currentUser.id}
                  onBack={() => setCurrentPage('home')}
                  onChatOpen={(chatId) => {
                    console.log("App: Opening Yap Room:", chatId);
                    
                    // Force the app into "Chat Mode" with this specific ID
                    setChatData({
                        chatId: chatId, 
                        users: [] // Empty users array signals ChatPage to fetch details itself
                    });
                    
                    setCurrentPage('chat');
                  }}
                />
              ) : currentPage === 'home' ? (
                <HomePage
                  socket={globalSocketRef.current}
                  currentUserId={currentUser.id}
                  currentUsername={currentUser.username}
                  initialTags={currentUser.interests || []}
                  globalNotifications={globalNotifications}
                  globalFriendRequests={globalFriendRequests}
                  setGlobalNotifications={setGlobalNotifications}
                  setGlobalFriendRequests={setGlobalFriendRequests}
                  unreadCount={unreadCount}
                  notification={pageNotification}
                  initialQueueState={queueState}
                  setQueueState={setQueueState}
                  onNotificationChange={setPageNotification}
                  onChatStart={() => {
                    // HomePage calls this right before joining queue
                    // so future matches are not ignored.
                    chatExitRef.current = false;
                  }}

                  onProfileOpen={() => setCurrentPage('profile')}
                  onYappingCardsOpen={() => setCurrentPage('yapping-cards')}
                  onAdminOpen={() => setCurrentPage('admin')}
                  onInboxOpen={() => {
                    console.log('App: Inbox opened. Resetting unread count and navigating to inbox page.');
                    setUnreadCount(0);
                    setInboxKey(prev => prev + 1);
                    setCurrentPage('inbox');
                  }}
                  children={renderCallUI()}
                />
              ) : currentPage === 'inbox' ? (
                <InboxPage
                  key={inboxKey}
                  socket={globalSocketRef.current}
                  currentUserId={currentUser.id}
                  currentUsername={currentUser.username}
                  onBack={() => setCurrentPage('home')}
                  onChatOpen={(friend) => {
                    console.log('App: Opening friend chat from inbox with friend:', friend);
                    setSelectedFriend(friend);
                    setChatData(null);
                    setCurrentPage('chat');
                  }}
                  children={renderCallUI()}
                />
              ) : currentPage === 'profile' ? (
                <ProfilePage
                  currentUserId={currentUser.id}
                  currentUsername={currentUser.username}
                  onBack={() => setCurrentPage('home')}
                  children={renderCallUI()}
                />
              ) : (
                chatData?.chatId?.startsWith('yap_') ? (
                  <FireChatPage {...{
                    socket: globalSocketRef.current,
                    user: currentUser,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    initialChatData: chatData,
                    onGoHome: handleGoHome
                  }} />
                ) : (
                <ChatPage 
                  socket={globalSocketRef.current}
                  user={currentUser}
                  currentUserId={currentUser.id}
                  currentUsername={currentUser.username}
                  initialChatData={chatData}
                  targetFriend={selectedFriend}
                  suggestedTopic={suggestedTopic}
                  setSuggestedTopic={setSuggestedTopic}
                  globalNotifications={globalNotifications}
                  globalFriendRequests={globalFriendRequests}
                  setGlobalNotifications={setGlobalNotifications}
                  setGlobalFriendRequests={setGlobalFriendRequests}
                  unreadCount={unreadCount}
                  callStatus={callStatus}
                  onStartCall={(chatId, partner) => startCall(chatId, partner)}
                  onHangupCall={hangupCall}
                  onGoHome={handleGoHome}
                  onInboxOpen={() => {
                    setUnreadCount(0);
                    setInboxKey(prev => prev + 1);
                    setCurrentPage('inbox');
                  }}
                  children={renderCallUI()}
                />
                )
              )}
            </>
          )
        } />
      </Routes>
  );
}

export default App;
