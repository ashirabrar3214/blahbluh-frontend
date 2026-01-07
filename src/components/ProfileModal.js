import React from 'react';

function ProfileModal({ user, onClose }) {

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#000000] border border-[#fefefe]/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffbd59]/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#fefefe]">Profile</h2>
            <button onClick={onClose} className="text-[#fefefe]/60 hover:text-[#fefefe] transition-colors">
              ✕
            </button>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full shadow-2xl">
              {/* Background Layer */}
              <div className={`absolute inset-0 rounded-full overflow-hidden ${user?.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'}`} style={user?.pfp_background ? { backgroundImage: `url(${user.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
              
              {/* PFP Layer */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transform-gpu">
                {user?.pfp ? (
                  <img src={user.pfp} alt="Profile" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-bold text-[#fefefe]">{user?.username?.charAt(0).toUpperCase() || '?'}</span>
                )}
              </div>

              {/* Circle/Border Layer (Top most) */}
              <div className="absolute inset-0 rounded-full border-4 border-black pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Username</label>
              <div className="px-4 py-3 bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl text-[#fefefe]">
                {user?.username || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Gender</label>
              <div className="px-4 py-3 bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl text-[#fefefe]">
                {user?.gender || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Country</label>
              <div className="px-4 py-3 bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl text-[#fefefe]">
                {user?.country || 'Not specified'}
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full px-4 py-3.5 bg-[#ffbd59] hover:bg-[#ffbd59]/90 rounded-xl text-black font-bold transition-all shadow-lg shadow-[#ffbd59]/20 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;