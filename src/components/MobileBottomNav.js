import React from 'react';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const CardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
  </svg>
);

export default function MobileBottomNav({ onHome, onYaps, onInbox, onProfile, unreadCount, pfpUrl, isBanned, activeTab }) {
  const getTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#ffbd59]' : 'text-[#fefefe]/60 hover:text-[#ffbd59]'}`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/90 backdrop-blur-xl border-t border-[#fefefe]/10 pb-4 pt-2 z-50">
        <div className="flex justify-around items-center h-14">
            <button onClick={onHome} className={getTabClass('home')}>
                <HomeIcon />
                <span className="text-[10px] font-medium">Home</span>
            </button>
            <button onClick={onYaps} className={getTabClass('yapping-cards')}>
                <CardsIcon />
                <span className="text-[10px] font-medium">Yaps</span>
            </button>
            <button onClick={onInbox} className={`${getTabClass('inbox')} relative`}>
                <InboxIcon />
                <span className="text-[10px] font-medium">Inbox</span>
                {!isBanned && unreadCount > 0 && (
                    <span className="absolute top-0 right-3 w-2 h-2 bg-[#ffbd59] rounded-full animate-pulse"></span>
                )}
            </button>
            <button onClick={onProfile} className={getTabClass('profile')}>
                <div className="w-5 h-5 rounded-full overflow-hidden bg-[#fefefe]/10">
                     {pfpUrl ? <img src={pfpUrl} className="w-full h-full object-cover" alt="Profile" /> : <UserIcon />}
                </div>
                <span className="text-[10px] font-medium">Profile</span>
            </button>
        </div>
      </div>
  );
}