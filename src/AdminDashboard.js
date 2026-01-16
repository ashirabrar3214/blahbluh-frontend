import React, { useEffect, useState } from 'react';
import { api } from './api';

function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getReportedUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load reported users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBan = async (userId) => {
    const reason = prompt("Enter ban reason:", "Violating Terms");
    if (!reason) return;
    const hours = prompt("Enter ban duration (hours):", "24");
    
    try {
      await api.banUser(userId, reason, Number(hours));
      alert('User banned successfully');
      loadData(); // Refresh list
    } catch (err) {
      alert('Failed to ban user: ' + err.message);
    }
  };

  const handleUnban = async (userId) => {
    if (!window.confirm("Are you sure you want to unban this user?")) return;
    try {
      await api.unbanUser(userId);
      alert('User unbanned successfully');
      loadData(); // Refresh list
    } catch (err) {
      alert('Failed to unban user: ' + err.message);
    }
  };

  if (loading) return <div className="text-white p-10">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#ffbd59]">Moderation Dashboard</h1>
          <button onClick={onBack} className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700">
            Exit Admin
          </button>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

        <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Reports (24h)</th>
                <th className="p-4">Last Reported</th>
                <th className="p-4">Warnings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                      {user.pfp ? <img src={user.pfp} alt="" className="w-full h-full object-cover"/> : null}
                    </div>
                    <div>
                      <div className="font-bold">{user.username}</div>
                      <div className="text-xs text-zinc-500 font-mono">{user.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">{user.uniqueReporters24h}</td>
                  <td className="p-4 text-zinc-400 text-sm">
                    {new Date(user.lastReportTime).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">{user.warning_count}</td>
                  <td className="p-4">
                    {user.status === 'banned' ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">BANNED</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">ACTIVE</span>
                    )}
                  </td>
                  <td className="p-4 text-right gap-2 flex justify-end">
                    {user.status === 'banned' ? (
                      <button 
                        onClick={() => handleUnban(user.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm font-bold text-white transition-colors"
                      >
                        Unban
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBan(user.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-sm font-bold text-white transition-colors"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-zinc-500">No reported users found. Good job!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;