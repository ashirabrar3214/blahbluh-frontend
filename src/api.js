const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
  async generateUserId() {
    console.log('🆔 Generating random user ID...');
    const response = await fetch(`${API_BASE_URL}/api/generate-user-id`);
    const data = await response.json();
    console.log('✅ Generated user ID:', data.userId);
    return data;
  },

  async getUser(userId) {
    console.log(`API: getUser called with userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}`);
    const data = await response.json();
    console.log(`API: getUser response for ${userId}:`, data);
    return data;
  },

  async updateUser(userId, updates) {
    console.log(`API: updateUser called for userId: ${userId} with updates:`, updates);
    const response = await fetch(`${API_BASE_URL}/api/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    console.log(`API: updateUser response for ${userId}:`, data);
    return data;
  },

  async updateUserPfp(userId, pfpLink) {
    console.log(`API: updateUserPfp called for userId: ${userId} with pfpLink:`, pfpLink);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/pfp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pfpLink })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: updateUserPfp response for ${userId}:`, data);
    return data;
  },

  async getUserPfp(userId) {
    console.log(`API: getUserPfp called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/pfp`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async reportUser(userId) {
    console.log(`API: reportUser called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/report`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log(`API: reportUser response for ${userId}:`, data);
    return data;
  },

  async addFriend(userId, friendId) {
    console.log(`API: addFriend called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId })
    });
    const data = await response.json();
    console.log(`API: addFriend response for ${userId}:`, data);
    return data;
  },

  async joinQueue(userId, tags) {
    console.log('API: Joining queue with userId:', userId, 'and tags:', tags);
    const response = await fetch(`${API_BASE_URL}/api/join-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tags })
    });
    const data = await response.json();
    console.log('API: Join queue response:', data);
    return data;
  },

  async sendUserInterests(userId, tags) {
    console.log('API: Sending user interests:', tags, 'for user:', userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/update-interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tags })
      });
      if (!response.ok) {
        console.error('API: Failed to send user interests, status:', response.status);
      }
      return await response.json();
    } catch (error) {
      console.error('API: Error sending user interests:', error);
    }
  },

  async getUserInterests(userId) {
    console.log(`API: getUserInterests called for userId: ${userId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-interests/${userId}`);
      if (!response.ok) {
        console.warn(`API: getUserInterests failed with status ${response.status}`);
        return [];
      }
      const data = await response.json();
      console.log(`API: getUserInterests response for ${userId}:`, data);
      return data.interests || [];
    } catch (error) {
      console.error('API: Error getting user interests:', error);
      return [];
    }
  },

  async leaveQueue(userId) {
    console.log('API: Leaving queue for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/leave-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    console.log('API: Leave queue response:', data);
    return data;
  },

  async getQueueStatus(userId) {
    console.log('API: Getting queue status for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/queue-status/${userId}`);
    const data = await response.json();
    console.log('API: Queue status response:', data);
    return data;
  },

  async sendFriendRequest(fromUserId, toUserId) {
    console.log('API: Sending friend request');
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
    console.log(`API: getFriendRequests called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-requests/${userId}`);
    const data = await response.json();
    console.log(`API: getFriendRequests response for ${userId}:`, data);
    return data;
  },

  async acceptFriendRequest(requestId, userId) {
    console.log(`API: acceptFriendRequest called for requestId: ${requestId} and userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/accept-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    });
    const data = await response.json();
    console.log(`API: acceptFriendRequest response for ${requestId}:`, data);
    return data;
  },

  async getFriends(userId) {
    console.log(`API: getFriends called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friends/${userId}`);
    const data = await response.json();
    console.log(`API: getFriends response for ${userId}:`, data);

    // Fetch PFPs for each friend
    const friendsWithPfps = await Promise.all(data.map(async (friend) => {
      try {
        const friendId = friend.userId || friend.id;
        const pfpData = await this.getUserPfp(friendId);
        return { ...friend, pfp: pfpData.pfp || pfpData.pfpLink || friend.pfp };
      } catch (error) {
        console.warn(`API: Failed to load PFP for friend ${friend.userId || friend.id}:`, error);
        return friend;
      }
    }));

    return friendsWithPfps;
  },

  async blockUser(userId, blockedUserId) {
    console.log(`API: blockUser called for userId: ${userId} to block ${blockedUserId}`);
    const response = await fetch(`${API_BASE_URL}/api/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blockedUserId })
    });
    const data = await response.json();
    console.log(`API: blockUser response for ${userId}:`, data);
    return data;
  },
  
  async submitReview(reviewerId, reviewedUserId, rating) {
    console.log(`API: submitReview called from ${reviewerId} for ${reviewedUserId} with rating ${rating}`);
    const res = await fetch(`${API_BASE_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, reviewedUserId, rating })
    });
    const data = await res.json();
    console.log(`API: submitReview response:`, data);
    return data;
  },

  async getReview(reviewerId, reviewedUserId) {
    console.log(`API: getReview called from ${reviewerId} for ${reviewedUserId}`);
    const res = await fetch(
      `${API_BASE_URL}/api/review/${reviewerId}/${reviewedUserId}`
    );
    const data = await res.json();
    console.log(`API: getReview response:`, data);
    return data;
  },

  async getUserRating(userId) {
    console.log(`API: getUserRating called for userId: ${userId}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-rating/${userId}`);
      if (!res.ok) {
        console.error(`API: getUserRating failed for ${userId} with status ${res.status}`);
        return { reviewCount: 0, averageRating: 0 };
      }
      const data = await res.json();
      console.log(`API: getUserRating raw response for ${userId}:`, data);

      // The backend might return an array, and with snake_case keys. Let's normalize it.
      const rawRating = Array.isArray(data) ? data[0] : data;

      // FIX: Check for 'count' (backend format) OR 'review_count' (legacy/db format)
      // and 'average' (backend format) OR 'average_rating'
      const count = rawRating.count !== undefined ? rawRating.count : rawRating.review_count;
      const avg = rawRating.average !== undefined ? rawRating.average : rawRating.average_rating;

      if (count === undefined) {
        return { reviewCount: 0, averageRating: 0 };
      }

      return {
        reviewCount: parseInt(count, 10) || 0,
        averageRating: parseFloat(avg) || 0,
      };
    } catch (error) {
      console.error(`API: Error in getUserRating for ${userId}:`, error);
      return { reviewCount: 0, averageRating: 0 };
    }
  },
  
  async getFriendChats(userId) {
    console.log(`API: getFriendChats called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-chats/${userId}`);
    const data = await response.json();
    console.log(`API: getFriendChats response for ${userId}:`, data);
    return data;
  },

  async sendFriendMessage(chatId, userId, message) {
    console.log(`API: sendFriendMessage called for chatId: ${chatId} from userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, userId, message })
    });
    const data = await response.json();
    console.log(`API: sendFriendMessage response for ${chatId}:`, data);
    return data;
  },

  async getFriendChatMessages(chatId) {
    console.log(`API: getFriendChatMessages called for chatId: ${chatId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-chat-messages/${chatId}`);
    if (!response.ok) {
      console.error(`API: getFriendChatMessages error for chatId: ${chatId}, status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`API: getFriendChatMessages response for ${chatId}:`, data);
    return data;
  },

  async getUnreadCount(userId, friendId) {
    console.log(`API: getUnreadCount called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/unread-count/${userId}/${friendId}`);
    const data = await response.json();
    console.log(`API: getUnreadCount response for ${userId}/${friendId}:`, data);
    return data;
  },

  async markMessagesAsRead(userId, friendId) {
    console.log(`API: markMessagesAsRead called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendId })
    });
    const data = await response.json();
    console.log(`API: markMessagesAsRead response for ${userId}/${friendId}:`, data);
    return data;
  },

  async suggestTopic(userId) {
    console.log(`API: suggestTopic called for userId: ${userId}`);
    if (!userId) {
      throw new Error('A userId is required to suggest a topic.');
    }
    const response = await fetch(`${API_BASE_URL}/api/suggest-topic/${userId}`);
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      console.error('Failed to suggest a topic:', response.status, errorBody);
      throw new Error(`Failed to suggest a topic. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`API: suggestTopic response for ${userId}:`, data);
    return data; // expecting { success: true, suggestion: '...' }
  },

  async exitChat(socketId, userId, chatId, requeuePartner = false) {
    console.log(`API: exitChat called with socketId: ${socketId}, userId: ${userId}, chatId: ${chatId}, requeuePartner: ${requeuePartner}`);
    const response = await fetch(`${API_BASE_URL}/api/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socketId, userId, chatId, action: 'EXIT_CHAT', requeuePartner })
    });
    const data = await response.json();
    console.log(`API: exitChat response:`, data);
    return data;
  },

  async skipChat(socketId, userId, chatId) {
    console.log(`API: skipChat called with socketId: ${socketId}, userId: ${userId}, chatId: ${chatId}`);
    const response = await fetch(`${API_BASE_URL}/api/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socketId, userId, chatId, action: 'SKIP' })
    });
    const data = await response.json();
    console.log(`API: skipChat response:`, data);
    return data;
  }
};