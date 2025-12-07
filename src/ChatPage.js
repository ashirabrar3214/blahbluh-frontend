import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { api } from './api';

function ChatPage({ user }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const socketRef = useRef(null);

  // Socket setup + registration
  useEffect(() => {
    console.log('Connecting to socket server...');
    socketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
    console.log('Connected to server | Socket ID:', socketRef.current.id);
    // Registration is handled by the other useEffect when currentUserId changes
  });


    socketRef.current.on('chat-paired', (data) => {
      console.log('Chat paired!', data);
      const partner = data.users.find(u => u.userId !== currentUserId);
      if (partner) {
        setChatId(data.chatId);
        setChatPartner(partner);
        setInQueue(false);
        setMessages([]);
        socketRef.current.emit('join-chat', { chatId: data.chatId });
        console.log('Joined room:', data.chatId);
      }
    });

    socketRef.current.on('new-message', (msg) => {
      console.log('New message:', msg);
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      console.log('Cleaning up socket...');
      socketRef.current?.disconnect();
    };
  }, []); // Run only once on mount

  // Re-register user when currentUserId is set
  useEffect(() => {
    if (currentUserId && socketRef.current?.connected) {
      socketRef.current.emit('register-user', { userId: currentUserId });
      console.log('Registered user with server:', currentUserId);
    }
  }, [currentUserId]);

  const joinQueue = async () => {
    try {
      let userId = currentUserId;

      if (!userId) {
        console.log('Generating new user...');
        const gen = await api.generateUserId();
        userId = gen.userId;
        setCurrentUserId(userId);
      }

      console.log('Joining queue as:', userId);
      const response = await api.joinQueue(userId, user.displayName);
      console.log('Join queue response:', response);

      setInQueue(true);
      pollQueueStatus();
    } catch (error) {
      console.error('Failed to join queue:', error);
    }
  };

  const leaveQueue = async () => {
    if (!currentUserId) return;

    try {
      await api.leaveQueue(currentUserId);
      setInQueue(false);
      setQueuePosition(0);
      console.log('Left queue');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const pollQueueStatus = () => {
    const interval = setInterval(async () => {
      if (!currentUserId) {
        clearInterval(interval);
        return;
      }

      try {
        const status = await api.getQueueStatus(currentUserId);
        if (!status.inQueue) {
          clearInterval(interval);
          setInQueue(false);
          setQueuePosition(0);
        } else {
          setQueuePosition(status.queuePosition);
        }
      } catch (err) {
        console.error('Queue polling error:', err);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    const msgData = {
      chatId,
      message: newMessage.trim(),
      userId: currentUserId,
      username: user.displayName,
    };

    socketRef.current.emit('send-message', msgData);
    setNewMessage('');
  };

  const startNewChat = () => {
    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    setCurrentUserId(null);
    setInQueue(false);
    setQueuePosition(0);
  };

  // Chat UI
  if (chatId && chatPartner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Chatting with {chatPartner.username}</h1>
            <button onClick={startNewChat} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
              New Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.userId === currentUserId ? 'bg-purple-600' : 'bg-gray-700'}`}>
                <p className="text-xs opacity-80">{msg.username}</p>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={sendMessage} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Queue / Landing UI
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Random Chat</h1>
          <span className="text-sm opacity-80">
            {user.displayName} {currentUserId && `(${currentUserId.slice(0, 8)}...)`}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>

          {inQueue ? (
            <div>
              <h2 className="text-3xl font-bold mb-3">Finding someone...</h2>
              <p className="text-gray-400 mb-6">Position in queue: {queuePosition}</p>
              <button onClick={leaveQueue} className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-medium">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold mb-3">Ready to chat?</h2>
              <p className="text-gray-400 mb-8">Connect with a random stranger instantly</p>
              <button onClick={joinQueue} className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-xl font-bold shadow-lg">
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;