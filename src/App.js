import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatPage from './ChatPage';
import HomePage from './HomePage';
import InboxPage from './InboxPage';
import SignupForm from './components/SignupForm';
import { api } from './api';
import { makeFriendChatId } from './utils/chatUtils';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('signup');
  const [inboxKey, setInboxKey] = useState(0);
  
  // Data props for ChatPage
  const [activeChatData, setActiveChatData] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const globalSocketRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Initialize Global Socket
    globalSocketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
      query: { userId: currentUser.id }
    });

    // 2. Background Join Helper
    const joinAllFriendRooms = async () => {
      try {
        const friends = await api.getFriends(currentUser.id);
        if (globalSocketRef.current?.connected) {
           friends.forEach(friend => {
              const friendId = friend.userId || friend.id;
              if (friendId) {
                  const chatId = makeFriendChatId(currentUser.id, friendId);
                  globalSocketRef.current.emit('join-chat', { chatId });
              }
           });
           console.log(`✅ Background joined ${friends.length} friend rooms`);
        }
      } catch (e) { console.error('BG Join Error:', e); }
    };

    globalSocketRef.current.on('connect', () => {
      console.log('🌐 Global socket connected');
      globalSocketRef.current.emit('register-user', { userId: currentUser.id });
      joinAllFriendRooms();
    });

    // Listen for Random Chat Pairing
    globalSocketRef.current.on('chat-paired', (data) => {
      console.log('🤝 Chat paired globally:', data);
      setActiveChatData(data);
      setSelectedFriend(null); // Clear friend if random chat starts
      setCurrentPage('chat');
    });

    // Notifications & Friend Requests
    globalSocketRef.current.on('friend-request-accepted', () => {
      setInboxKey(prev => prev + 1);
      joinAllFriendRooms();
    });

    globalSocketRef.current.on('new-message', () => {
      setInboxKey(prev => prev + 1);
    });

    globalSocketRef.current.on('partner-disconnected', () => {
      console.log('👋 Partner disconnected globally');
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
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!currentUser) {
    return <SignupForm onComplete={handleSignupComplete} loading={loading} />;
  }

  if (currentPage === 'home') {
    return (
      <HomePage
        socket={globalSocketRef.current} // <--- PASS SOCKET
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
          // CAPTURE FRIEND DATA
          const friendId = friend.userId || friend.id;
          const chatId = makeFriendChatId(currentUser.id, friendId);
          setSelectedFriend({ ...friend, userId: friendId, chatId });
          setActiveChatData(null);
          setCurrentPage('friend-chat');
        }}
      />
    );
  }

  // Unified Chat Page
  return (
    <ChatPage 
      user={currentUser}
      currentUserId={currentUser.id}
      currentUsername={currentUser.username}
      
      socket={globalSocketRef.current} // <--- PASS SOCKET
      initialChatData={activeChatData} // <--- PASS RANDOM DATA
      targetFriend={selectedFriend}    // <--- PASS FRIEND DATA
      
      onGoHome={() => {
        setActiveChatData(null);
        setSelectedFriend(null);
        setCurrentPage('home');
      }}
      onInboxOpen={() => {
        setInboxKey(prev => prev + 1);
        setCurrentPage('inbox');
      }}
    />
  );
}

export default App;
