import React, { useEffect, useId, useState, useRef } from 'react';

const MALE_PFP_BASE_URL = 'https://pub-c61675e13cbd40ad973b2415bf4bbbe2.r2.dev';
const FEMALE_PFP_BASE_URL = 'https://pub-c344659298794c9f96898621acc3f91a.r2.dev';
const PFP_FILES = [
  'b (1).png',
  'b (5).png',
  'c.png',
  'd.png',
  'e.png',
  'f.png',
  'g.png',
  'h.png',
  'i.png',
  'j.png',
  'k.png',
  'l.png',
  'm.png',
  'n.png',
  'o.png',
    'p.png',
    'q.png',
    'r.png',
    's.png',
    't.png',
    'u.png',
];

const BG_BASE_URL = 'https://pub-f0d85aac44cf4aa895afe84cb6649484.r2.dev';
const BG_FILES = [
  'a.png',
];

const malePfpUrls = PFP_FILES.map(file => `${MALE_PFP_BASE_URL}/${encodeURIComponent(file)}`);
const femalePfpUrls = PFP_FILES.map(file => `${FEMALE_PFP_BASE_URL}/${encodeURIComponent(file)}`);
const bgUrls = BG_FILES.map(file => `${BG_BASE_URL}/${encodeURIComponent(file)}`);

function PfpSelect({ onSave, onClose, currentPfp, currentBg }) {
  const titleId = useId();
  const [previewPfp, setPreviewPfp] = useState(currentPfp || malePfpUrls[0]);
  const [previewBg, setPreviewBg] = useState(currentBg || '');
  
  const malePfpScrollRef = useRef(null);
  const femalePfpScrollRef = useRef(null);
  const bgScrollRef = useRef(null);
  
  const malePfpScrollTimeout = useRef(null);
  const femalePfpScrollTimeout = useRef(null);
  const bgScrollTimeout = useRef(null);
  
  const isMalePfpScrolling = useRef(false);
  const isFemalePfpScrolling = useRef(false);
  const isBgScrolling = useRef(false);

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Scroll to initial PFP on mount
  useEffect(() => {
    setPreviewPfp(currentPfp || malePfpUrls[0]);
    setPreviewBg(currentBg || '');

    const maleContainer = malePfpScrollRef.current;
    if (maleContainer && currentPfp) {
      const elementToScrollTo = maleContainer.querySelector(`[data-pfp-url="${currentPfp}"]`);
      if (elementToScrollTo) {
        setTimeout(() => {
          elementToScrollTo.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 0);
      }
    }

    const femaleContainer = femalePfpScrollRef.current;
    if (femaleContainer && currentPfp) {
      const elementToScrollTo = femaleContainer.querySelector(`[data-pfp-url="${currentPfp}"]`);
      if (elementToScrollTo) {
        setTimeout(() => {
          elementToScrollTo.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 0);
      }
    }
    
    const bgContainer = bgScrollRef.current;
    if (bgContainer) {
      const selector = currentBg ? `[data-bg-url="${currentBg}"]` : '[data-bg-url=""]';
      const elementToScrollTo = bgContainer.querySelector(selector);
      if (elementToScrollTo) {
        setTimeout(() => {
          elementToScrollTo.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 0);
      }
    }
  }, [currentPfp, currentBg]);

  const handleConfirm = () => {
    onSave({ pfp: previewPfp, bg: previewBg });
    onClose();
  };

  const createScrollHandler = (ref, timeoutRef, isScrollingRef, setPreview, dataAttr) => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrollingRef.current = true;
    timeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      const container = ref.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let closestElement = null;
      let minDistance = Infinity;

      container.childNodes.forEach(child => {
        if (child.nodeType === 1) { // Ensure it's an element
          const childRect = child.getBoundingClientRect();
          const childCenter = childRect.left + childRect.width / 2;
          const distance = Math.abs(containerCenter - childCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestElement = child;
          }
        }
      });

      if (closestElement) {
        const val = closestElement.dataset[dataAttr];
        if (val !== undefined) setPreview(val);
      }
    }, 150); // Debounce time
  };

  const handleMalePfpScroll = createScrollHandler(malePfpScrollRef, malePfpScrollTimeout, isMalePfpScrolling, setPreviewPfp, 'pfpUrl');
  const handleFemalePfpScroll = createScrollHandler(femalePfpScrollRef, femalePfpScrollTimeout, isFemalePfpScrolling, setPreviewPfp, 'pfpUrl');
  const handleBgScroll = createScrollHandler(bgScrollRef, bgScrollTimeout, isBgScrolling, setPreviewBg, 'bgUrl');

  const handleThumbnailClick = (val, setPreview, ref, dataAttr, isScrollingRef) => {
    if (isScrollingRef.current) return;
    setPreview(val);
    const container = ref.current;
    if (container) {
      const selector = `[data-${dataAttr}="${val}"]`;
      const el = container.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-[#000000]/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-[#fefefe]/10 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ffbd59]/20 blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
          <h2 id={titleId} className="text-xl font-bold text-[#fefefe] tracking-tight">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fefefe]/5 hover:bg-[#fefefe]/10 text-[#fefefe]/60 hover:text-[#fefefe] transition-colors" 
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        {/* Main Preview */}
          <div className="flex-1 flex items-center justify-center mb-10 min-h-0 relative z-10">
            <div className="relative group">
              {/* Glow effect behind preview */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ffbd59] to-[#ff907c] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

              {/* Preview Circle (clip happens here) */}
              <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-2xl isolate [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
                {/* Background Layer */}
                <div
                  className={`absolute inset-0 ${previewBg ? 'bg-black' : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'}`}
                  style={
                    previewBg
                      ? {
                          backgroundImage: `url(${previewBg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                />

                {/* PFP Layer */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={previewPfp}
                    alt="Selected Avatar"
                    className="w-full h-full object-contain object-center block"
                    draggable={false}
                  />
                </div>

                {/* Border Layer (Top most) */}
                <div className="absolute inset-0 rounded-full border-4 border-black/50 ring-1 ring-[#fefefe]/10 pointer-events-none" />
              </div>
            </div>
          </div>


        {/* Male Avatar Carousel */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider">Male Avatars</h3>
            <span className="text-[10px] text-[#fefefe]/60 bg-[#fefefe]/5 px-2 py-0.5 rounded-full border border-[#fefefe]/5">Scroll to select</span>
          </div>
          
          <div className="relative -mx-6">
            {/* Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />

            <div 
              ref={malePfpScrollRef}
              onScroll={handleMalePfpScroll}
              className="flex items-center gap-4 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            >
              {malePfpUrls.map((url, index) => (
                <button
                  key={url}
                  data-pfp-url={url}
                  onClick={() => handleThumbnailClick(url, setPreviewPfp, malePfpScrollRef, 'pfp-url', isMalePfpScrolling)}
                  className={`snap-center shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ease-out ${
                    previewPfp === url 
                      ? 'ring-2 ring-[#fefefe] scale-110 shadow-lg shadow-[#ffbd59]/20 opacity-100 z-10' 
                      : 'ring-1 ring-[#fefefe]/10 scale-90 opacity-40 hover:opacity-80 hover:scale-100 grayscale hover:grayscale-0'
                  }`}
                >
                  <img src={url} alt={`Male Option ${index + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Female Avatar Carousel */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider">Female Avatars</h3>
            <span className="text-[10px] text-[#fefefe]/60 bg-[#fefefe]/5 px-2 py-0.5 rounded-full border border-[#fefefe]/5">Scroll to select</span>
          </div>
          
          <div className="relative -mx-6">
            {/* Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />

            <div 
              ref={femalePfpScrollRef}
              onScroll={handleFemalePfpScroll}
              className="flex items-center gap-4 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            >
              {femalePfpUrls.map((url, index) => (
                <button
                  key={url}
                  data-pfp-url={url}
                  onClick={() => handleThumbnailClick(url, setPreviewPfp, femalePfpScrollRef, 'pfp-url', isFemalePfpScrolling)}
                  className={`snap-center shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ease-out ${
                    previewPfp === url 
                      ? 'ring-2 ring-[#fefefe] scale-110 shadow-lg shadow-[#ffbd59]/20 opacity-100 z-10' 
                      : 'ring-1 ring-[#fefefe]/10 scale-90 opacity-40 hover:opacity-80 hover:scale-100 grayscale hover:grayscale-0'
                  }`}
                >
                  <img src={url} alt={`Female Option ${index + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Background Carousel */}
        <div className="mb-6 relative z-10">
          <h3 className="text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-3 px-1">Background</h3>
          
          <div className="relative -mx-6">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />

            <div 
              ref={bgScrollRef}
              onScroll={handleBgScroll}
              className="flex items-center gap-4 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            >
              {/* Default BG Option */}
              <button
                data-bg-url=""
                onClick={() => handleThumbnailClick('', setPreviewBg, bgScrollRef, 'bg-url', isBgScrolling)}
                className={`snap-center shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ease-out flex items-center justify-center bg-gradient-to-br from-[#ffbd59] to-[#ff907c] ${
                  previewBg === '' 
                    ? 'ring-2 ring-[#fefefe] scale-110 shadow-lg shadow-[#ff907c]/20 opacity-100 z-10' 
                    : 'ring-1 ring-[#fefefe]/10 scale-90 opacity-40 hover:opacity-80 hover:scale-100'
                }`}
              >
                <span className="text-[10px] font-bold text-[#fefefe]/90">None</span>
              </button>

              {bgUrls.map((url) => (
                <button
                  key={url}
                  data-bg-url={url}
                  onClick={() => handleThumbnailClick(url, setPreviewBg, bgScrollRef, 'bg-url', isBgScrolling)}
                  className={`snap-center shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ease-out bg-black ${
                    previewBg === url 
                      ? 'ring-2 ring-[#fefefe] scale-110 shadow-lg shadow-[#ffbd59]/20 opacity-100 z-10' 
                      : 'ring-1 ring-[#fefefe]/10 scale-90 opacity-40 hover:opacity-80 hover:scale-100 grayscale hover:grayscale-0'
                  }`}
                >
                  <img src={url} alt="Background option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-auto shrink-0 flex gap-3 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3.5 bg-[#fefefe]/10 hover:bg-[#fefefe]/20 rounded-2xl text-[#fefefe]/60 hover:text-[#fefefe] transition-all font-medium text-sm border border-[#fefefe]/5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3.5 bg-[#ffbd59] text-black hover:bg-[#ffbd59]/80 rounded-2xl transition-all font-bold text-sm shadow-lg shadow-[#ffbd59]/20 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default PfpSelect;
