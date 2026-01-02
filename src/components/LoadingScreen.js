import React from 'react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000] text-[#fefefe] font-sans animate-in fade-in duration-300">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffbd59]/10 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff907c]/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Spinner Container */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#fefefe]/10"></div>
            {/* Spinning Gradient Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-t-[#ffbd59] border-r-[#ff907c] border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Logo */}
            <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="Logo" className="w-10 h-10 object-contain z-10 rounded-[18%]" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2 z-10">
            <h3 className="text-lg font-medium text-[#fefefe] tracking-wide">{message}</h3>
            <div className="flex gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd59] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd59] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd59] animate-bounce"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
