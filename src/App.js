import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatPage from './ChatPage';
import HomePage from './HomePage';
import InboxPage from './InboxPage';
import ProfilePage from './ProfilePage';
import SignupForm from './components/SignupForm';
import { api } from './api';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('signup');
  const [inboxKey, setInboxKey] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [pageNotification, setPageNotification] = useState(null);
  const [suggestedTopic, setSuggestedTopic] = useState(null);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [globalFriendRequests, setGlobalFriendRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const globalSocketRef = useRef(null);
  const currentPageRef = useRef(currentPage);
  const chatExitRef = useRef(false);


  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (chatData && suggestedTopic) {
      console.log("Partner and topic ready, navigating to chat");
      setSelectedFriend(null);
      setCurrentPage('chat');
    }
  }, [chatData, suggestedTopic]);

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

    globalSocketRef.current.on('connect', () => {
      console.log('Global socket connected');
      console.log('App: Emitting "register-user" for user:', currentUser.id);
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
      // Fetch unread messages on connect
      console.log('App: Emitting "fetch-unread-messages" for user:', currentUser.id);
      globalSocketRef.current.emit('fetch-unread-messages', { userId: currentUser.id });
    });

    // Listen for chat pairing
    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('Chat paired globally:', data);

      // If we just explicitly exited, ignore ONE match event only,
      // then immediately re-enable matching.
      if (chatExitRef.current) {
        console.log('Ignoring chat-paired due to explicit exit (one-shot)');
        chatExitRef.current = false;
        return;
      }

      setChatData(data);
    });

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
    if (!messageData?.chatId?.startsWith('friend_')) return;
    // ✅ do NOT count messages you sent yourself
    if (messageData?.userId === currentUser.id) return;
    const page = currentPageRef.current;
    console.log(`App: Received 'new-message' on page: ${page}. Message:`, messageData);
    // ✅ do not increment while user is reading chat or inbox
    if (page !== 'chat' && page !== 'inbox') {
      console.log('App: Incrementing unread count.');
      setUnreadCount(prev => prev + 1);
    }
    console.log('APP new-message', messageData);

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


    return () => {
      console.log('App: Disconnecting global socket for user:', currentUser.id);
      globalSocketRef.current?.disconnect();
    };
  }, [currentUser]);

  const handleSignupComplete = async (signupData) => {
    console.log('App: handleSignupComplete called with data:', signupData);
    setLoading(true);
    try {
      console.log('App: Calling api.generateUserId...');
      const gen = await api.generateUserId();
      console.log('App: Generated user ID:', gen.userId);
      console.log('App: Calling api.updateUser...');
      const user = await api.updateUser(gen.userId, signupData);
      console.log('App: Signup complete, created user:', user);

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
      <>
        {loading && <LoadingScreen message="Creating your account..." />}
        <SignupForm
          onComplete={handleSignupComplete}
          loading={loading}
        />
      </>
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
        setSuggestedTopic={setSuggestedTopic}
        unreadCount={unreadCount}
        notification={pageNotification}
        onNotificationChange={setPageNotification}
        onChatStart={() => {
          // HomePage calls this right before joining queue
          // so future matches are not ignored.
          chatExitRef.current = false;
        }}

        onProfileOpen={() => setCurrentPage('profile')}
        onInboxOpen={() => {
          console.log('App: Inbox opened. Resetting unread count and navigating to inbox page.');
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
        currentUsername={currentUser.username}
        onBack={() => setCurrentPage('home')}
        onChatOpen={(friend) => {
          console.log('App: Opening friend chat from inbox with friend:', friend);
          setSelectedFriend(friend);
          setChatData(null);
          setCurrentPage('chat');
        }}
      />
    );
  }

  if (currentPage === 'profile') {
    return (
      <ProfilePage
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
        onBack={() => setCurrentPage('home')}
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
      suggestedTopic={suggestedTopic}
      setSuggestedTopic={setSuggestedTopic}
      globalNotifications={globalNotifications}
      globalFriendRequests={globalFriendRequests}
      setGlobalNotifications={setGlobalNotifications}
      setGlobalFriendRequests={setGlobalFriendRequests}
      unreadCount={unreadCount}
      onGoHome={() => {
        console.log('App: Navigating to home page from chat.');
        chatExitRef.current = true;
        setSelectedFriend(null);
        setChatData(null);
        setPageNotification(null);
        setSuggestedTopic(null);
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
