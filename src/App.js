import React, { useState, useEffect } from 'react';
import HomePage from './HomePage';
import ChatPage from './ChatPage';
import ProfilePage from './ProfilePage';
import { api } from './api';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'chat', 'profile'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const generateUser = async () => {
      try {
        const gen = await api.generateUserId();
        setCurrentUserId(gen.userId);
        setCurrentUsername(gen.username);
      } catch (error) {
        console.error('Error generating user:', error);
      }
    };
    generateUser();
  }, []);

  const handleChatStart = (chatId, partner, socket) => {
    setChatData({ chatId, partner, socket });
    setCurrentView('chat');
  };

  const handleChatEnd = (reason = null) => {
    setChatData(null);
    setCurrentView('home');
    if (reason === 'partner-disconnected') {
      setNotification('partner-disconnected');
    }
  };

  const handleProfileOpen = () => {
    setCurrentView('profile');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  if (currentView === 'chat' && chatData) {
    return (
      <ChatPage
        chatId={chatData.chatId}
        chatPartner={chatData.partner}
        socket={chatData.socket}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
        onChatEnd={handleChatEnd}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <ProfilePage
        currentUsername={currentUsername}
        currentUserId={currentUserId}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <HomePage
      onChatStart={handleChatStart}
      onProfileOpen={handleProfileOpen}
      currentUsername={currentUsername}
      currentUserId={currentUserId}
      notification={notification}
      onNotificationChange={setNotification}
    />
  );
}

export default App;
