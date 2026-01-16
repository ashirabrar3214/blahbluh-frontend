import React, { useEffect, useState } from 'react';
import { api } from './api';

function AdminDashboard({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Function to load data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getReportedUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
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

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setUserDetails(null);
    try {
      const data = await api.getUserReports(user.id);
      setUserDetails(data);
    } catch (err) {
      console.error("Failed to load details", err);
      alert("Failed to load user details: " + err.message);
    } finally {
      setLoadingDetails(false);
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
                    <button 
                      onClick={() => handleViewDetails(user)}
                      className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium text-white transition-colors mr-2"
                    >
                      View
                    </button>
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

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-800/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {selectedUser.pfp && <img src={selectedUser.pfp} className="w-8 h-8 rounded-full object-cover" alt="" />}
                  Report History: {selectedUser.username}
                </h2>
                <button onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-white text-2xl leading-none">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetails ? (
                    <div className="text-center py-10 text-zinc-500">Loading details...</div>
                ) : userDetails ? (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-zinc-400 text-xs uppercase font-bold">Total Reports</div>
                            <div className="text-2xl font-bold text-white mt-1">{userDetails.stats?.totalReports || 0}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-zinc-400 text-xs uppercase font-bold">Unique Reporters</div>
                            <div className="text-2xl font-bold text-white mt-1">{userDetails.stats?.uniqueReporters || 0}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-zinc-400 text-xs uppercase font-bold">Times Banned</div>
                            <div className="text-2xl font-bold text-red-400 mt-1">{userDetails.stats?.banCount || 0}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-zinc-400 text-xs uppercase font-bold">Last Banned</div>
                            <div className="text-sm font-medium text-white mt-2">
                              {userDetails.stats?.lastBanDate ? new Date(userDetails.stats.lastBanDate).toLocaleDateString() : 'Never'}
                            </div>
                          </div>
                      </div>

                      {/* Reports List */}
                      <div>
                          <h3 className="text-lg font-bold text-white mb-4">Reports ({userDetails.reports?.length || 0})</h3>
                          <div className="space-y-3">
                            {userDetails.reports?.map((report, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold uppercase">
                                        {report.reason}
                                      </span>
                                      <span className="text-zinc-500 text-xs">
                                        {new Date(report.created_at).toLocaleString()}
                                      </span>
                                  </div>
                                  <div className="text-sm text-zinc-300 mb-2">
                                      <span className="text-zinc-500">Reported by:</span> {report.reporter_username || 'Anonymous'}
                                  </div>
                                  {report.message_context && (
                                      <div className="bg-black/50 p-3 rounded-lg text-xs font-mono text-zinc-400 border border-white/5">
                                        "{report.message_context}"
                                      </div>
                                  )}
                                </div>
                            ))}
                            {(!userDetails.reports || userDetails.reports.length === 0) && (
                                <div className="text-zinc-500 italic">No detailed reports found.</div>
                            )}
                          </div>
                      </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-red-400">Failed to load data.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;