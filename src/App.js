import React, { useState, useEffect } from 'react';
import HomePage from './HomePage';
import ChatPage from './ChatPage';
import { api } from './api';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'chat'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [chatData, setChatData] = useState(null);

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

  const handleChatEnd = () => {
    setChatData(null);
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

  return (
    <HomePage
      onChatStart={handleChatStart}
      currentUsername={currentUsername}
      currentUserId={currentUserId}
    />
  );
}

export default App;