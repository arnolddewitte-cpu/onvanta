export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let videoId: string | null = null

    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0]
    } else if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      if (u.pathname === '/watch') {
        videoId = u.searchParams.get('v')
      } else if (u.pathname.startsWith('/embed/')) {
        videoId = u.pathname.slice(7)
      } else if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.slice(8)
      }
    }

    if (!videoId) return null
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  } catch {
    return null
  }
}

export function getVimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== 'vimeo.com' && u.hostname !== 'www.vimeo.com') return null

    const match = u.pathname.match(/^\/(\d+)/)
    if (!match) return null

    return `https://player.vimeo.com/video/${match[1]}`
  } catch {
    return null
  }
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null
  return getYouTubeEmbedUrl(url) ?? getVimeoEmbedUrl(url) ?? null
}
