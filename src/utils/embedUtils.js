export const extractClipUrl = (text) => {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
};

export const getEmbedConfig = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;

    // --- INSTAGRAM ---
    if (hostname.includes('instagram.com')) {
      // capture both the type (p/reel/reels/tv) and the shortcode
      const regex = /instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/;
      const match = cleanUrl.match(regex);

      if (match && match[1] && match[2]) {
        const kind = match[1];      // p | reel | reels | tv
        const code = match[2];      // shortcode

        return {
          type: 'instagram',
          // IMPORTANT: use the same kind you detected (reel stays reel)
          src: `https://www.instagram.com/${kind}/${code}/embed/`
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
        return {
          type: 'snapchat',
          src: `https://story.snapchat.com/embed/${pathParts[idIndex + 1]}`
        };
      }
    }

    return null;
  } catch (e) {
    return null;
  }
};