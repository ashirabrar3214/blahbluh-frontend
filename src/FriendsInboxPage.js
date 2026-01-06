import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { api } from './api';
import { makeFriendChatId } from './utils/chatUtils';
import LoadingScreen from './components/LoadingScreen';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

function FriendsInboxPage({ currentUserId, currentUsername, onBack }) {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const [pfpUrl, setPfpUrl] = useState(null);

  const loadFriendChats = useCallback(async () => {
    setLoading(true);
    
    try {
      const friends = await api.getFriends(currentUserId);
      
      if (friends && friends.length > 0) {
        const friendChats = await Promise.all(friends.map(async (friend) => {
          const friendId = friend.userId || friend.id;
          const friendName = friend.username;
          const chatId = makeFriendChatId(currentUserId, friendId);
          
          let pfp = friend.pfp;
          let pfpBg = friend.pfp_background || '';
          try {
            const pfpData = await api.getUserPfp(friendId);
            pfp = pfpData.pfp || pfpData.pfpLink || friend.pfp;
            pfpBg = pfpData.pfp_background || pfpBg;
          } catch (error) {
            console.warn('Failed to load PFP for friend:', friendId);
          }

          return {
            id: chatId,
            friendId: friendId,
            friendName: friendName,
            pfp,
            pfpBg,
            lastMessage: 'Start a conversation...',
            lastMessageTime: null,
            isOnline: false
          };
        }));
        
        setFriendChats(friendChats);
      } else {
        setFriendChats([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriendChats([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const loadChatMessages = useCallback(async (chatId) => {
    try {
      const chatMessages = await api.getFriendChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.log('Chat messages API not available, starting with empty chat');
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadFriendChats();
    
    socketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current.on('connect', () => {
      if (currentUserId) {
        socketRef.current.emit('register-user', { userId: currentUserId });
      }
    });

    socketRef.current.on('new-message', (messageData) => {
      if (selectedChatRef.current && messageData.chatId === selectedChatRef.current.id) {
        setMessages(prev => [...prev, messageData]);
      }
      setFriendChats(prev => prev.map(chat => 
        chat.id === messageData.chatId 
          ? { ...chat, lastMessage: messageData.message, lastMessageTime: messageData.timestamp }
          : chat
      ));
    });

    socketRef.current.on('friend-request-accepted', () => {
      console.log('✅ Friend request accepted, reloading friends');
      loadFriendChats();
    });

    return () => socketRef.current?.disconnect();
  }, [currentUserId, loadFriendChats]);

  useEffect(() => {
    if (!currentUserId) return;
    let ignore = false;
    const loadPfp = async () => {
      try {
        const pfpData = await api.getUserPfp(currentUserId);
        if (!ignore && pfpData) {
          const url = pfpData.pfp || pfpData.pfpLink;
          if (url) setPfpUrl(url);
        }
      } catch (error) {
        console.error('Error loading user PFP:', error);
      }
    };
    loadPfp();
    return () => { ignore = true; };
  }, [currentUserId]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    if (selectedChat) {
      loadChatMessages(selectedChat.id);
    }
  }, [selectedChat, loadChatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      chatId: selectedChat.id,
      userId: currentUserId,
      username: currentUsername,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      await api.sendFriendMessage(selectedChat.id, currentUserId, newMessage.trim());
    } catch (error) {
      console.log('Friend message API not available, using local storage for now');
    }
    
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    
    setFriendChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString() }
        : chat
    ));
    
    socketRef.current?.emit('send-message', messageData);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading chats..." />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">
          <BackIcon />
        </button>
        {selectedChat ? (
          <>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                selectedChat.pfpBg ? 'bg-black' : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}
              style={selectedChat.pfpBg ? { backgroundImage: `url(${selectedChat.pfpBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {selectedChat.pfp ? (
                <img src={selectedChat.pfp} alt={`${selectedChat.friendName}'s avatar`} className="w-full h-full object-contain" />
              ) : (
                <span className="font-bold text-sm">{selectedChat.friendName[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold">{selectedChat.friendName}</h1>
              <p className="text-xs text-zinc-400">
                {selectedChat.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </>
        ) : (
          <h1 className="text-lg font-bold">Friends</h1>
        )}
        <div className="ml-auto">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
            {pfpUrl ? (
              <img src={pfpUrl} alt="Profile" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs font-bold text-zinc-400">
                {currentUsername?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-zinc-800`}>
          {friendChats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
              <p className="text-zinc-400 text-sm">Add friends during chats to start messaging them directly!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {friendChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-zinc-900' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden flex-shrink-0 ${
                        chat.pfpBg ? 'bg-black' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}
                      style={chat.pfpBg ? { backgroundImage: `url(${chat.pfpBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    >
                      {chat.pfp ? (
                        <img src={chat.pfp} alt={`${chat.friendName}'s avatar`} className="w-full h-full object-contain" />
                      ) : (
                        chat.friendName[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{chat.friendName}</h3>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-zinc-400">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-zinc-400 truncate mt-1">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedChat ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.userId === currentUserId;
                return (
                  <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      isOwn 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-zinc-800 text-gray-100 rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-zinc-400'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedChat.friendName}...`}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    newMessage.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 mx-auto">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Friend</h3>
              <p className="text-zinc-400">Choose a friend from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsInboxPage;
