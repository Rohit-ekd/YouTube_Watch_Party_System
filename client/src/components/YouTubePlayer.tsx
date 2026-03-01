import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";

interface Props {
  videoId?: string;
  onReady: (player: any) => void;
  onPlay?: (time: number) => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onVideoLoading?: (loading: boolean) => void;
  onDurationChange?: (duration: number) => void;
  autoPlay?: boolean;
  socketId?: string;
}

export interface YouTubePlayerRef {
  play: (time?: number) => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, Props>(function YouTubePlayer(
  { videoId, onReady, onPlay, onPause, onSeek, onVideoLoading, onDurationChange, autoPlay = false },
  ref
): React.ReactElement {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isEmittingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const isInternalSeekRef = useRef(false);
  const isVideoLoadingRef = useRef(false);
  const previousVideoIdRef = useRef<string | undefined>(undefined);
  const durationRef = useRef(0);

  // Expose player methods to parent via ref
  useImperativeHandle(ref, () => ({
    play: (time?: number) => {
      if (playerRef.current) {
        isEmittingRef.current = true;
        if (time !== undefined) {
          playerRef.current.seekTo(time);
        }
        playerRef.current.playVideo();
        // Increased timeout to prevent loop - YouTube player takes time to fire state change
        setTimeout(() => { isEmittingRef.current = false; }, 1000);
      }
    },
    pause: () => {
      if (playerRef.current) {
        isEmittingRef.current = true;
        playerRef.current.pauseVideo();
        // Increased timeout to prevent loop
        setTimeout(() => { isEmittingRef.current = false; }, 1000);
      }
    },
    seekTo: (time: number) => {
      if (playerRef.current) {
        isInternalSeekRef.current = true;
        isEmittingRef.current = true;
        lastSeekTimeRef.current = time;
        playerRef.current.seekTo(time);
        setTimeout(() => { 
          isInternalSeekRef.current = false; 
          isEmittingRef.current = false;
        }, 1000);
      }
    },
    getCurrentTime: () => {
      try {
        return playerRef.current?.getCurrentTime() || 0;
      } catch {
        return 0;
      }
    },
    getDuration: () => {
      try {
        return playerRef.current?.getDuration() || 0;
      } catch {
        return 0;
      }
    },
    loadVideoById: (videoId: string) => {
      console.log("loadVideoById called with:", videoId);
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
      } else {
        console.error("Player not ready when loadVideoById called");
      }
    },
    playVideo: () => {
      if (playerRef.current) {
        isEmittingRef.current = true;
        playerRef.current.playVideo();
        // Increased timeout to prevent loop
        setTimeout(() => { isEmittingRef.current = false; }, 1000);
      }
    },
    pauseVideo: () => {
      if (playerRef.current) {
        isEmittingRef.current = true;
        playerRef.current.pauseVideo();
        // Increased timeout to prevent loop
        setTimeout(() => { isEmittingRef.current = false; }, 1000);
      }
    }
  }), []);

  const handleSeek = useCallback((time: number) => {
    if (!isInternalSeekRef.current && Math.abs(time - lastSeekTimeRef.current) > 1) {
      lastSeekTimeRef.current = time;
      isEmittingRef.current = true;
      onSeek?.(time);
      setTimeout(() => { isEmittingRef.current = false; }, 200);
    }
  }, [onSeek]);

  // REMOVED: The setInterval was causing infinite seek loop
  // Time sync is now handled by useVideo.ts via socket events

  useEffect(() => {
    if (!videoId) return;
    
    // Check if video is actually changing
    const isNewVideo = previousVideoIdRef.current !== videoId;
    if (isNewVideo) {
      console.log("Video changing from:", previousVideoIdRef.current, "to:", videoId);
      previousVideoIdRef.current = videoId;
      
      // Set loading state
      isVideoLoadingRef.current = true;
      onVideoLoading?.(true);
    }
    
    const loadAPI = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
          resolve();
        } else {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
          (window as any).onYouTubeIframeAPIReady = () => resolve();
        }
      });
    };

    loadAPI().then(() => {
      if (!containerRef.current) return;

      // If player already exists, just load the new video
      if (playerRef.current) {
        console.log("Player exists, loading new video:", videoId);
        isEmittingRef.current = true; // Prevent events while loading new video
        playerRef.current.loadVideoById(videoId);
        
        // Reset after a short delay to allow video to start
        setTimeout(() => {
          isVideoLoadingRef.current = false;
          isEmittingRef.current = false;
          onVideoLoading?.(false);
        }, 1000);
        return;
      }

      // Create new player
      console.log("Creating new player with videoId:", videoId);
      playerRef.current = new (window as any).YT.Player(
        containerRef.current,
        {
          height: "100%",
          width: "100%",
          videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 1,
            rel: 0,
            fs: 1,
            modestbranding: 1,
            iv_load_policy: 3,
            disablekb: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("Player onReady fired");
              isVideoLoadingRef.current = false;
              
              // Get duration after player is ready
              try {
                const dur = event.target.getDuration();
                durationRef.current = dur;
                onDurationChange?.(dur);
                console.log("Duration:", dur);
              } catch (e) {
                console.log("Could not get duration:", e);
              }
              
              onVideoLoading?.(false);
              onReady(event.target);
              if (autoPlay) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // Don't emit events while video is loading or if already emitting
              if (isEmittingRef.current || isVideoLoadingRef.current) {
                console.log("Skipping event emission - loading or emitting:", { 
                  isLoading: isVideoLoadingRef.current, 
                  isEmitting: isEmittingRef.current 
                });
                return;
              }

              const state = event.data;
              const player = playerRef.current;
              
              if (state === (window as any).YT.PlayerState.PLAYING) {
                isEmittingRef.current = true;
                try {
                  const currentTime = player?.getCurrentTime() || 0;
                  lastSeekTimeRef.current = currentTime;
                  onPlay?.(currentTime);
                  
                  // Also update duration while playing in case it wasn't available initially
                  try {
                    const dur = player?.getDuration();
                    if (dur && dur !== durationRef.current) {
                      durationRef.current = dur;
                      onDurationChange?.(dur);
                    }
                  } catch (e) {}
                } catch (e) {}
                setTimeout(() => { isEmittingRef.current = false; }, 100);
              } else if (state === (window as any).YT.PlayerState.PAUSED) {
                isEmittingRef.current = true;
                onPause?.();
                setTimeout(() => { isEmittingRef.current = false; }, 100);
              } else if (state === (window as any).YT.PlayerState.BUFFERING) {
                try {
                  const currentTime = player?.getCurrentTime() || 0;
                  if (Math.abs(currentTime - lastSeekTimeRef.current) > 0.5) {
                    handleSeek(currentTime);
                  }
                } catch (e) {}
              } else if (state === (window as any).YT.PlayerState.ENDED) {
                onPause?.();
              }
            }
          }
        }
      );
    });
  }, [videoId, onReady, onPlay, onPause, handleSeek, autoPlay, onVideoLoading, onDurationChange]);

  if (!videoId) return <div className="w-full aspect-video bg-black rounded-xl"></div>;

  return (
    <div 
      ref={containerRef} 
      className="w-full aspect-video bg-black rounded-xl overflow-hidden"
    ></div>
  );
});

export default YouTubePlayer;
