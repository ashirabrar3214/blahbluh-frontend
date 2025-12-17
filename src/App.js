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
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatData, setChatData] = useState(null);

  const globalSocketRef = useRef(null);
  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const loadUnreadCount = async (userId) => {
    try {
      const friends = await api.getFriends(userId);
      let total = 0;
      for (const friend of friends) {
        const fid = friend.userId || friend.id;
        const count = await api.getUnreadCount(userId, fid);
        total += count;
      }
      setUnreadCount(total);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    globalSocketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
    });

    globalSocketRef.current.on('connect', () => {
      console.log('🌐 Global socket connected');
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
      
      loadUnreadCount(currentUser.id);
      
      api.getFriends(currentUser.id).then(friends => {
        friends.forEach(friend => {
          const fid = friend.userId || friend.id;
          const chatId = `friend_${[currentUser.id, fid].sort().join('_')}`;
          globalSocketRef.current.emit('join-chat', { chatId });
        });
      });
    });

    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('🤝 Chat paired globally:', data);
      setChatData(data);
      setCurrentPage('chat');
    });

    globalSocketRef.current.on('friend-request-accepted', async () => {
      setInboxKey(prev => prev + 1);
      try {
        const friends = await api.getFriends(currentUser.id);
        friends.forEach(friend => {
          const fid = friend.userId || friend.id;
          const chatId = `friend_${[currentUser.id, fid].sort().join('_')}`;
          globalSocketRef.current.emit('join-chat', { chatId });
        });
      } catch (error) {
        console.error('Error re-joining friend rooms:', error);
      }
    });

    globalSocketRef.current.on('friend-message-received', (messageData) => {
      console.log('📨 New friend message:', messageData);
      if (currentPageRef.current !== 'inbox' && currentPageRef.current !== 'friend-chat') {
        setUnreadCount(prev => prev + 1);
      }
    });

    globalSocketRef.current.on('partner-disconnected', () => {
      setCurrentPage('home');
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

  if (!currentUser) {
    return <SignupForm onComplete={handleSignupComplete} loading={loading} />;
  }

  if (currentPage === 'home') {
    return (
      <HomePage
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
        unreadCount={unreadCount}
        onChatStart={() => setCurrentPage('chat')}
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
        currentUserId={currentUser.id}
        onBack={() => {
            loadUnreadCount(currentUser.id);
            setCurrentPage('home');
        }}
        onChatOpen={(friend) => {
          setSelectedFriend(friend);
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
      unreadCount={unreadCount}
      onGoHome={() => {
        setSelectedFriend(null);
        setChatData(null);
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
