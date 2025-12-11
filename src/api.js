const API_BASE_URL = 'https://blahbluh-production.up.railway.app';
export const api = {
  async generateUserId() {
    console.log('🆔 Generating random user ID...');
    const response = await fetch(`${API_BASE_URL}/api/generate-user-id`);
    const data = await response.json();
    console.log('✅ Generated user ID:', data.userId);
    return data;
  },

  async joinQueue(userId, username) {
    console.log('🔄 API: Joining queue with userId:', userId, 'username:', username);
    const response = await fetch(`${API_BASE_URL}/api/join-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username })
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
  }
};