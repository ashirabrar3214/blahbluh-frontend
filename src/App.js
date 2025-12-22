import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatPage from './ChatPage';
import HomePage from './HomePage';
import InboxPage from './InboxPage';
import SignupForm from './components/SignupForm';
import { api } from './api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('signup');
  const [inboxKey, setInboxKey] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [pageNotification, setPageNotification] = useState(null);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [globalFriendRequests, setGlobalFriendRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const globalSocketRef = useRef(null);
  const currentPageRef = useRef(currentPage);
  const chatExitRef = useRef(false);


  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
    // Load initial unread count when user is set
  useEffect(() => {
    if (!currentUser) return;
    
    const loadInitialUnreadCount = async () => {
      try {
        const friends = await api.getFriends(currentUser.id);
        let totalUnread = 0;
        for (const friend of friends) {
          const friendId = friend.userId || friend.id;
          try {
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

  useEffect(() => {
    if (!currentUser) return;

    // Setup global socket connection
    globalSocketRef.current = io(
    process.env.REACT_APP_API_URL || 'http://localhost:3000',
    {
      transports: ['websocket'],
      reconnection: true,
    }
  );

    globalSocketRef.current.on('connect', () => {
      console.log('Global socket connected');
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
      // Fetch unread messages on connect
      globalSocketRef.current.emit('fetch-unread-messages', { userId: currentUser.id });
    });

    // Listen for chat pairing
    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('Chat paired globally:', data);

      if (chatExitRef.current) {
        console.log('Ignoring chat-paired due to explicit exit');
        return;
      }

      chatExitRef.current = false;

      setChatData(data);
      setSelectedFriend(null);
      setCurrentPage('chat');
    });

    // Background presence for friend chats
    const setupFriendPresence = async () => {
      try {
        const friends = await api.getFriends(currentUser.id);
        friends.forEach(friend => {
          const friendId = friend.userId || friend.id;
          if (!friendId) return;

          const chatId = `friend_${[currentUser.id, friendId].sort().join('_')}`;
          globalSocketRef.current.emit('join-chat', { chatId });
        });
      } catch (error) {
        console.error('Error setting up friend presence:', error);
      }
    };

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
      setGlobalNotifications(prev => [notification, ...prev]);
      setInboxKey(prev => prev + 1);
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
    if (!messageData?.chatId?.startsWith('friend_')) return;
    // ✅ do NOT count messages you sent yourself
    if (messageData?.userId === currentUser.id) return;
    const page = currentPageRef.current;
    // ✅ do not increment while user is reading chat or inbox
    if (page !== 'chat' && page !== 'inbox') {
      setUnreadCount(prev => prev + 1);
    }
    console.log('APP new-message', messageData);

  });
  
    globalSocketRef.current.on('partner-disconnected', () => {
      console.log('Partner disconnected globally');
      // Only use this as a banner trigger when user is already on Home.
      if (currentPageRef.current === 'home') {
        setPageNotification('partner-disconnected');
      }
      // DO NOT force navigation; ChatPage handles the flow.
    });


    return () => globalSocketRef.current?.disconnect();
  }, [currentUser]);

  const handleSignupComplete = async (signupData) => {
    setLoading(true);
    try {
      const gen = await api.generateUserId();
      const user = await api.updateUser(gen.userId, signupData);
      setCurrentUser(user);
      setCurrentPage('home');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // 🔥 GLOBAL SIGNUP GATE
  if (!currentUser) {
    return (
      <SignupForm
        onComplete={handleSignupComplete}
        loading={loading}
      />
    );
  }

  // ✅ App content only AFTER signup
  if (currentPage === 'home') {
    return (
      <HomePage
        socket={globalSocketRef.current}
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
        globalNotifications={globalNotifications}
        globalFriendRequests={globalFriendRequests}
        setGlobalNotifications={setGlobalNotifications}
        setGlobalFriendRequests={setGlobalFriendRequests}
        unreadCount={unreadCount}
        notification={pageNotification}
        onNotificationChange={setPageNotification}

        onChatStart={() => {
          chatExitRef.current = false;
          setCurrentPage('chat');
        }}

        onProfileOpen={() => {}}
        onInboxOpen={() => {
          setUnreadCount(0);
          setInboxKey(prev => prev + 1);
          setCurrentPage('inbox');
        }}
      />
    );
  }

  if (currentPage === 'inbox') {
    return (
      <InboxPage
        key={inboxKey}
        socket={globalSocketRef.current}
        currentUserId={currentUser.id}
        onBack={() => setCurrentPage('home')}
        onChatOpen={(friend) => {
          setSelectedFriend(friend);
          setChatData(null);
          setCurrentPage('chat');
        }}
      />
    );
  }

  return (
    <ChatPage 
      socket={globalSocketRef.current}
      user={currentUser}
      currentUserId={currentUser.id}
      currentUsername={currentUser.username}
      initialChatData={chatData}
      targetFriend={selectedFriend}
      globalNotifications={globalNotifications}
      globalFriendRequests={globalFriendRequests}
      setGlobalNotifications={setGlobalNotifications}
      setGlobalFriendRequests={setGlobalFriendRequests}
      unreadCount={unreadCount}
      onGoHome={() => {
        chatExitRef.current = true;
        setSelectedFriend(null);
        setChatData(null);
        setPageNotification(null);
        setCurrentPage('home');
      }}
      onInboxOpen={() => {
        setUnreadCount(0);
        setInboxKey(prev => prev + 1);
        setCurrentPage('inbox');
      }}
    />
  );
}

export default App;
