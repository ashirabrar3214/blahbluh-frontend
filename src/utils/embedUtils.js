export const getEmbedConfig = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;

    // --- INSTAGRAM REELS/POSTS ---
    if (hostname.includes('instagram.com')) {
      // FIX 1: Regex now allows dots/underscores ([\w-.]+) which were breaking some links
      const match = cleanUrl.match(/\/(?:p|reel|reels)\/([\w-.]+)/);
      if (match && match[1]) {
        return {
          type: 'instagram',
          // FIX 2: Force use of '/p/' (Post) endpoint. 
          // '/reel/' embed endpoints often redirect to the full page on some devices. 
          // '/p/' is the universal embedder for both Posts and Reels.
          // FIX 3: Added 'wp=540' to request a cleaner player size.
          src: `https://www.instagram.com/p/${match[1]}/embed/?cr=1&v=14&wp=540`
        };
      }
    }

    // --- TIKTOK ---
    if (hostname.includes('tiktok.com')) {
      const match = cleanUrl.match(/video\/(\d+)/);
      if (match && match[1]) {
        return {
          type: 'tiktok',
          src: `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`
        };
      }
    }

    // --- SNAPCHAT ---
    if (hostname.includes('snapchat.com')) {
        const pathParts = urlObj.pathname.split('/');
        const idIndex = pathParts.findIndex(p => p === 'spotlight' || p === 'story' || p === 'add');
        
        if (idIndex !== -1 && pathParts[idIndex + 1]) {
            const id = pathParts[idIndex + 1];
            return {
                type: 'snapchat',
                src: `https://story.snapchat.com/embed/${id}`
            };
        }
    }

    return null;
  } catch (e) {
    return null;
  }
};