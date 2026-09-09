import React, { useEffect, useRef, useState } from 'react'
import { Music, Volume2, AlertCircle } from 'lucide-react'

const YOUTUBE_VIDEO_ID = 'rFZHOHl-L8A'
const EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?enablejsapi=1&autoplay=1&mute=1&playsinline=1&controls=0&disablekb=1&fs=0&rel=0`

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [embedDisabled, setEmbedDisabled] = useState(false)
    const playerRef = useRef(null)

    useEffect(() => {
        let isSubscribed = true

        const createPlayer = () => {
            if (!window.YT || !window.YT.Player) return

            try {
                playerRef.current = new window.YT.Player('youtube-music-player', {
                    events: {
                        onReady: (event) => {
                            if (!isSubscribed) return
                            setIsReady(true)
                            try {
                                // Attempt muted autoplay as per browser autoplay restrictions
                                event.target.mute()
                                event.target.playVideo()
                            } catch (e) {
                                // Autoplay might be restricted
                            }
                        },
                        onStateChange: (event) => {
                            if (!isSubscribed) return
                            // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
                                    setIsPlaying(!playerRef.current.isMuted())
                                }
                            } else if (
                                event.data === window.YT.PlayerState.PAUSED ||
                                event.data === window.YT.PlayerState.ENDED
                            ) {
                                setIsPlaying(false)
                            }
                        },
                        onError: (event) => {
                            if (!isSubscribed) return
                            console.warn('[MusicPlayer] YouTube Player Event Code:', event.data)
                            // 101 or 150: Video owner does not allow embedded playback
                            if (event.data === 101 || event.data === 150) {
                                setEmbedDisabled(true)
                            }
                        }
                    }
                })
            } catch (err) {
                console.warn('[MusicPlayer] Error initializing YouTube player:', err)
            }
        }

        // Check if YouTube IFrame API script is already loaded
        if (!window.YT || !window.YT.Player) {
            const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
            if (!existingScript) {
                const tag = document.createElement('script')
                tag.src = 'https://www.youtube.com/iframe_api'
                const firstScriptTag = document.getElementsByTagName('script')[0]
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
            }

            const prevCallback = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prevCallback === 'function') {
                    prevCallback()
                }
                if (isSubscribed) {
                    createPlayer()
                }
            }
        } else {
            createPlayer()
        }

        return () => {
            isSubscribed = false
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                try {
                    playerRef.current.destroy()
                } catch (e) {
                    // Cleanup safe
                }
            }
        }
    }, [])

    const toggleMusic = () => {
        if (embedDisabled) return

        if (!isPlaying) {
            if (playerRef.current) {
                try {
                    playerRef.current.unMute()
                    playerRef.current.setVolume(100)
                    playerRef.current.playVideo()
                    setIsPlaying(true)
                } catch (err) {
                    console.warn('[MusicPlayer] Could not play stream:', err)
                }
            } else {
                // Fallback postMessage if API object is not yet fully bound
                const iframe = document.getElementById('youtube-music-player')
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
                        '*'
                    )
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
                        '*'
                    )
                    setIsPlaying(true)
                }
            }
        } else {
            if (playerRef.current) {
                try {
                    playerRef.current.mute()
                    setIsPlaying(false)
                } catch (err) {
                    console.warn('[MusicPlayer] Could not mute stream:', err)
                }
            } else {
                const iframe = document.getElementById('youtube-music-player')
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'mute', args: [] }),
                        '*'
                    )
                    setIsPlaying(false)
                }
            }
        }
    }

    return (
        <div className="flex items-center">
            {/* Minimal/hidden YouTube player container */}
            <div
                className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
                aria-hidden="true"
            >
                <iframe
                    id="youtube-music-player"
                    title="Background Music Stream"
                    src={EMBED_URL}
                    allow="autoplay; encrypted-media"
                    width="100"
                    height="100"
                />
            </div>

            {/* Music Control Button in Navbar matching navbar font & typography */}
            <button
                type="button"
                onClick={toggleMusic}
                disabled={embedDisabled}
                className={`flex items-center gap-1.5 text-sm cursor-pointer hover:underline transition-all select-none ${
                    embedDisabled
                        ? 'opacity-50 cursor-not-allowed text-red-400'
                        : isPlaying
                        ? 'text-black font-medium'
                        : 'text-inherit'
                }`}
                title={
                    embedDisabled
                        ? 'YouTube live stream embedding is disabled by the video owner'
                        : isPlaying
                        ? 'Click to mute music'
                        : 'Click to enable background music'
                }
            >
                {embedDisabled ? (
                    <>
                        <AlertCircle size={15} />
                        <span>Music Disabled</span>
                    </>
                ) : isPlaying ? (
                    <>
                        <Volume2 size={15} className="animate-pulse" />
                        <span>Music On</span>
                    </>
                ) : (
                    <>
                        <Music size={15} />
                        <span>Enable Music</span>
                    </>
                )}
            </button>
        </div>
    )
}

export default MusicPlayer
