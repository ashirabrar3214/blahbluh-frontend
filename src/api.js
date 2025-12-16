const API_BASE_URL = 'https://blahbluh-production.up.railway.app';
export const api = {
  async generateUserId() {
    console.log('🆔 Generating random user ID...');
    const response = await fetch(`${API_BASE_URL}/api/generate-user-id`);
    const data = await response.json();
    console.log('✅ Generated user ID:', data.userId);
    return data;
  },

  async getUser(userId) {
    const response = await fetch(`${API_BASE_URL}/api/${userId}`);
    return await response.json();
  },

  async updateUser(userId, updates) {
    const response = await fetch(`${API_BASE_URL}/api/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await response.json();
  },

  async reportUser(userId) {
    const response = await fetch(`${API_BASE_URL}/api/${userId}/report`, {
      method: 'POST'
    });
    return await response.json();
  },

  async addFriend(userId, friendId) {
    const response = await fetch(`${API_BASE_URL}/api/${userId}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId })
    });
    return await response.json();
  },



  async joinQueue(userId) {
    console.log('🔄 API: Joining queue with userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/join-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    console.log('📝 API: Join queue response:', data);
    return data;
  },

  async leaveQueue(userId) {
    console.log('🚪 API: Leaving queue for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/leave-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    console.log('✅ API: Leave queue response:', data);
    return data;
  },

  async getQueueStatus(userId) {
    console.log('📊 API: Getting queue status for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/queue-status/${userId}`);
    const data = await response.json();
    console.log('📊 API: Queue status response:', data);
    return data;
  },

  async sendFriendRequest(fromUserId, toUserId) {
    console.log('🔵 API: Sending friend request');
    console.log('From User ID:', fromUserId);
    console.log('To User ID:', toUserId);
    
    const requestBody = { fromUserId, toUserId };
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/friend-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
  },

  async getFriendRequests(userId) {
    const response = await fetch(`${API_BASE_URL}/api/friend-requests/${userId}`);
    return await response.json();
  },

  async acceptFriendRequest(requestId, userId) {
    const response = await fetch(`${API_BASE_URL}/api/accept-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    });
    return await response.json();
  },

  async getFriends(userId) {
    const response = await fetch(`${API_BASE_URL}/api/friends/${userId}`);
    return await response.json();
  },

  async blockUser(userId, blockedUserId) {
    const response = await fetch(`${API_BASE_URL}/api/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blockedUserId })
    });
    return await response.json();
  },

  async getFriendChats(userId) {
    const response = await fetch(`${API_BASE_URL}/api/friend-chats/${userId}`);
    return await response.json();
  },

  async getFriendChatMessages(chatId) {
    const response = await fetch(`${API_BASE_URL}/api/friend-chat-messages/${chatId}`);
    return await response.json();
  },

  async sendFriendMessage(chatId, userId, message) {
    const response = await fetch(`${API_BASE_URL}/api/friend-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, userId, message })
    });
    return await response.json();
  }
};