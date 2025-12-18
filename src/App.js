import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatPage from './ChatPage';
import HomePage from './HomePage';
import FriendsInboxPage from './FriendsInboxPage';
import InboxPage from './InboxPage';
import SignupForm from './components/SignupForm';
import { api } from './api';
import { makeFriendChatId } from './utils/chatUtils';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('signup');
  const [inboxKey, setInboxKey] = useState(0);
  const globalSocketRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // Setup global socket connection
    globalSocketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
    });

    globalSocketRef.current.on('connect', () => {
      console.log('🌐 Global socket connected');
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
    });

    // Listen for chat pairing
    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('🤝 Chat paired globally:', data);
      setCurrentPage('chat');
    });

    // Listen for friend request acceptance globally
    globalSocketRef.current.on('friend-request-accepted', () => {
      console.log('🎉 Friend request accepted (global), refreshing inbox');
      setInboxKey(prev => prev + 1);
    });

    // Listen for new messages globally
    globalSocketRef.current.on('new-message', (messageData) => {
      console.log('📨 New message received globally:', messageData);
    });

    // Listen for partner disconnection
    globalSocketRef.current.on('partner-disconnected', () => {
      console.log('👋 Partner disconnected globally');
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
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
        onChatStart={() => setCurrentPage('chat')}
        onProfileOpen={() => {}}
        onInboxOpen={() => {
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
        onBack={() => setCurrentPage('home')}
        onChatOpen={(friend) => {
          // Navigate to friend chat using deterministic ID
          setCurrentPage('friend-chat');
        }}
      />
    );
  }

  return (
    <ChatPage 
      user={currentUser}
      currentUserId={currentUser.id}
      currentUsername={currentUser.username}
      onGoHome={() => setCurrentPage('home')}
      onInboxOpen={() => {
        setInboxKey(prev => prev + 1);
        setCurrentPage('inbox');
      }}
    />
  );
}

export default App;
