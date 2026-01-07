import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { api } from '../api';
import LoadingScreen from './LoadingScreen';
import BlockUserPopup from '../BlockUserPopup';
import ReportPopup from '../ReportPopup';

const ReportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

function PublicProfile({ targetUserId, currentUserId, currentUsername, onBack }) {
  const [profile, setProfile] = useState(null);
  const [ratingSummary, setRatingSummary] = useState({ average: null, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [actionToast, setActionToast] = useState(null);

  useEffect(() => {
    if (!targetUserId) return;
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [userProfile, ratingData, pfpData, interestsData] = await Promise.all([
          api.getUser(targetUserId),
          api.getUserRating(targetUserId),
          api.getUserPfp(targetUserId).catch(() => null),
          api.getUserInterests(targetUserId).catch(() => []),
        ]);

        const pfpUrl = pfpData?.pfp || pfpData?.pfpLink || userProfile.pfp;
        const pfpBg = pfpData?.pfp_background || userProfile.pfp_background || '';
        
        setProfile({
          ...userProfile,
          pfp: pfpUrl,
          pfp_background: pfpBg,
          interests: interestsData
        });

        setRatingSummary({
          average: ratingData.averageRating,
          count: ratingData.reviewCount
        });
      } catch (error) {
        console.error("Failed to load public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUserId]);

  useEffect(() => {
    if (!actionToast) return;
    const t = setTimeout(() => setActionToast(null), 2000);
    return () => clearTimeout(t);
  }, [actionToast]);

  const handleBlock = async () => {
    if (!currentUserId || !targetUserId) return;
    try {
      await api.blockUser(currentUserId, targetUserId);
      setShowBlockPopup(false);
      onBack();
    } catch (error) {
      console.error("Failed to block user:", error);
      setActionToast("Failed to block user");
    }
  };

  const handleReport = async (reason) => {
    if (!currentUserId || !targetUserId) return;
    setIsReporting(true);
    try {
       const reasonMapping = {
        "Hate Speech": "hate_speech",
        "Racism": "racism",
        "Violence": "violence",
        "Inappropriate Behavior": "inappropriate_behavior",
        "Nude Selling": "nude_selling",
        "Asking Personal Info": "asking_personal_info",
        "Others": "other"
      };
      const dbReason = reasonMapping[reason] || "other";

      const reportData = {
        reporter_user_id: currentUserId,
        reporter_username: currentUsername,
        reported_user_id: targetUserId,
        reported_username: profile?.username,
        reason: dbReason,
        created_at: new Date().toISOString()
      };

      await api.submitReport(reportData);
      setActionToast("Report submitted");
      setShowReportPopup(false);
    } catch (error) {
      console.error("Failed to report user:", error);
      setActionToast("Failed to report user");
    } finally {
      setIsReporting(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-white mb-4">User not found</p>
          <button onClick={onBack} className="px-4 py-2 bg-white text-black rounded-full font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onBack}>
      <div 
        className="w-full max-w-md bg-[#000000] text-[#fefefe] flex flex-col font-sans relative overflow-hidden selection:bg-[#ffbd59]/30 rounded-3xl border border-[#fefefe]/10 shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#ffbd59]/10 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#ff907c]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-[#ffbd59]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between z-10 relative shrink-0">
          <div className="w-8"></div> {/* Spacer for alignment */}
          
          <h1 className="text-sm font-bold text-[#fefefe]/40 uppercase tracking-widest">Partner</h1>
          
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fefefe]/10 text-[#fefefe] hover:bg-[#fefefe]/20 transition-colors"
          >
            ✕
          </button>
        </header>

        {/* Profile Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto z-10 relative
            [scrollbar-width:thin]
            [scrollbar-color:rgba(0,0,0,0.7)_transparent]
            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-black/70
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-black/90
">

          <div className="max-w-lg mx-auto pb-6">
            
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8"> 
              <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffbd59] to-[#ff907c] rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-28 h-28 rounded-full shadow-2xl">
                {/* Background Layer */}
                <div 
                  className={`absolute inset-0 rounded-full overflow-hidden ${
                    profile.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'
                  }`}
                  style={
                    profile.pfp_background 
                      ? { backgroundImage: `url(${profile.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : {}
                  }
                />

                {/* PFP Layer */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transform-gpu">
                  {profile.pfp ? (
                    <img src={profile.pfp} alt="Profile" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-4xl font-bold text-[#fefefe]">{getInitials(profile.username)}</span>
                  )}
                </div>

                {/* Border Layer */}
                <div className="absolute inset-0 rounded-full border-4 border-black pointer-events-none" />
              </div>
              </div>
              <h2 className="text-2xl font-bold text-[#fefefe] mt-4 tracking-tight">{profile.username}</h2>
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              
              {/* Grid for Age, Gender & Country */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-4 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                  <label className="block text-[#fefefe]/40 text-[10px] font-bold uppercase tracking-wider mb-1">Age</label>
                  <p className="text-base font-medium text-[#fefefe]">{profile.age || 'N/A'}</p>
                </div>

                <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-4 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                  <label className="block text-[#fefefe]/40 text-[10px] font-bold uppercase tracking-wider mb-1">Gender</label>
                  <p className="text-base font-medium text-[#fefefe] capitalize">{profile.gender || 'N/A'}</p>
                </div>

                <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-4 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                  <label className="block text-[#fefefe]/40 text-[10px] font-bold uppercase tracking-wider mb-1">Country</label>
                  <p className="text-base font-medium text-[#fefefe] truncate">{profile.country || 'N/A'}</p>
                </div>
              </div>

              {/* Interests */}
              <div className="bg-[#fefefe]/5 backdrop-blur-md rounded-2xl p-5 border border-[#fefefe]/5 hover:border-[#fefefe]/10 transition-colors">
                <label className="block text-[#fefefe]/40 text-[10px] font-bold uppercase tracking-wider mb-3">Interests</label>
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1.5 bg-[#fefefe]/10 text-[#fefefe] text-xs font-medium rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#fefefe]/40 text-sm italic">No interests added yet.</p>
                )}
              </div>

              {/* Your Reviews */}
              <div className="bg-gradient-to-br from-[#fefefe]/5 to-[#fefefe]/5 backdrop-blur-md rounded-2xl p-5 border border-[#fefefe]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbd59]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <label className="block text-[#fefefe]/40 text-[10px] font-bold uppercase tracking-wider mb-3 relative z-10">Community Rating</label>
                {ratingSummary.count > 0 ? (
                  <div className="flex items-end gap-3 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-[#fefefe] leading-none">{Number(ratingSummary.average || 0).toFixed(1)}</span>
                      <span className="text-[10px] text-[#fefefe]/40 font-medium mt-1">{ratingSummary.count} review{ratingSummary.count === 1 ? '' : 's'}</span>
                    </div>
                    <div className="mb-1">
                      <StarRating rating={ratingSummary.average} size="md" />
                    </div>
                  </div>
                ) : (
                  <p className="text-[#fefefe]/40 text-sm italic relative z-10">No reviews yet.</p>
                )}
              </div>
            </div>

            {/* Action Buttons: Report and Block */}
            <div className="flex gap-3 pt-6 mt-2">
               <button
                  onClick={() => setShowReportPopup(true)}
                  className="flex-1 py-3.5 rounded-2xl bg-[#fefefe]/5 border border-[#fefefe]/10 text-[#fefefe]/60 font-medium hover:bg-[#fefefe]/10 hover:text-[#fefefe] transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ReportIcon />
                  Report
                </button>
                <button
                  onClick={() => setShowBlockPopup(true)}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all text-sm border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <BlockIcon />
                  Block
                </button>
            </div>
          </div>
        </div>

        {/* Block Popup */}
        {showBlockPopup && (
          <BlockUserPopup
            username={profile.username}
            onBlock={handleBlock}
            onCancel={() => setShowBlockPopup(false)}
            onReport={() => {
              setShowBlockPopup(false);
              setShowReportPopup(true);
            }}
          />
        )}

        {/* Report Popup */}
        {showReportPopup && (
          <ReportPopup
            onCancel={() => setShowReportPopup(false)}
            onSubmit={handleReport}
            isSubmitting={isReporting}
          />
        )}

        {actionToast && (
          <div className="absolute top-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium text-white shadow-xl animate-in slide-in-from-top-4 fade-in">
              {actionToast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;