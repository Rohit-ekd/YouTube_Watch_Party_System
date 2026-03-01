import { useState, useCallback, useEffect, useRef, RefObject } from "react";
import { YouTubePlayerRef } from "../components/YouTubePlayer";
import socketService from "../services/socket";

export interface UseVideoReturn {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playerReady: boolean;
  isSyncingRef: { current: boolean };
  handlePlay: () => void;
  handlePause: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (seconds: number) => string;
  setPlayerReady: (ready: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsVideoLoading: (loading: boolean) => void;
}

interface UseVideoProps {
  playerRef: RefObject<YouTubePlayerRef | null>;
  roomId: string | undefined;
  myRole: "Host" | "Moderator" | "Participant" | "Viewer" | undefined;
}

export function useVideo({ playerRef, roomId, myRole }: UseVideoProps): UseVideoReturn {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  // Use useRef to create a persistent object that can be accessed in closures
  const isSyncingRef = { current: false };
  const lastSyncTimeRef = useRef(0);
  const isProcessingRemoteSyncRef = useRef(false);

  // Listen for sync_state events
  useEffect(() => {
    const cleanup = socketService.onSyncState((data) => {
      console.log("Sync state received:", data, "isVideoLoading:", isVideoLoading);
      
      // Don't sync while video is loading - this prevents infinite loop
      if (isVideoLoading) {
        console.log("Skipping sync - video is loading");
        return;
      }

      // Debounce: Skip if we just synced recently (within 1 second)
      const now = Date.now();
      if (now - lastSyncTimeRef.current < 1000) {
        console.log("Skipping sync - debounced (too soon)");
        return;
      }
      
      lastSyncTimeRef.current = now;
      isProcessingRemoteSyncRef.current = true;
      
      setIsPlaying(data.playState);
      setCurrentTime(data.currentTime);
      
      // Apply sync after player is ready
      if (playerRef.current && playerReady) {
        isSyncingRef.current = true;
        playerRef.current.seekTo(data.currentTime);
        if (data.playState) {
          playerRef.current.play(data.currentTime);
        } else {
          playerRef.current.pause();
        }
        setTimeout(() => { 
          isSyncingRef.current = false; 
          isProcessingRemoteSyncRef.current = false;
        }, 800);
      } else {
        // Reset processing flag if player not ready
        setTimeout(() => {
          isProcessingRemoteSyncRef.current = false;
        }, 800);
      }
    });
    return () => cleanup();
  }, [playerReady, playerRef, isVideoLoading]);

  // Listen for play events
  useEffect(() => {
    const cleanup = socketService.onPlay(({ time, senderId }) => {
      console.log("Play event received, time:", time, "isVideoLoading:", isVideoLoading, "senderId:", senderId);
      
      // Skip if event is from self
      if (senderId === socketService.getSocketId()) {
        console.log("Skipping play event - from self");
        return;
      }
      
      // Don't sync while video is loading
      if (isVideoLoading) {
        console.log("Skipping play sync - video is loading");
        return;
      }
      
      setIsPlaying(true);
      setCurrentTime(time);
      
      if (playerRef.current && playerReady) {
        isSyncingRef.current = true;
        try {
          playerRef.current.seekTo(time);
          playerRef.current.play(time);
        } catch (e) {
          console.error("Error syncing play:", e);
        }
        setTimeout(() => { isSyncingRef.current = false; }, 600);
      }
    });
    return () => cleanup();
  }, [playerReady, playerRef, isVideoLoading]);

  // Listen for pause events
  useEffect(() => {
    const cleanup = socketService.onPause(({ senderId }) => {
      console.log("Pause event received", "isVideoLoading:", isVideoLoading, "senderId:", senderId);
      
      // Skip if event is from self
      if (senderId === socketService.getSocketId()) {
        console.log("Skipping pause event - from self");
        return;
      }
      
      // Don't sync while video is loading
      if (isVideoLoading) {
        console.log("Skipping pause sync - video is loading");
        return;
      }
      
      setIsPlaying(false);
      
      if (playerRef.current && playerReady) {
        isSyncingRef.current = true;
        try {
          playerRef.current.pause();
        } catch (e) {
          console.error("Error syncing pause:", e);
        }
        setTimeout(() => { isSyncingRef.current = false; }, 600);
      }
    });
    return () => cleanup();
  }, [playerReady, playerRef, isVideoLoading]);

  // Listen for seek events
  useEffect(() => {
    const cleanup = socketService.onSeek(({ time, senderId }) => {
      console.log("Seek event received, time:", time, "isVideoLoading:", isVideoLoading, "senderId:", senderId);
      
      // Skip if event is from self
      if (senderId === socketService.getSocketId()) {
        console.log("Skipping seek event - from self");
        return;
      }
      
      // Don't sync while video is loading
      if (isVideoLoading) {
        console.log("Skipping seek sync - video is loading");
        return;
      }
      
      setCurrentTime(time);
      
      if (playerRef.current && playerReady) {
        isSyncingRef.current = true;
        try {
          playerRef.current.seekTo(time);
        } catch (e) {
          console.error("Error syncing seek:", e);
        }
        setTimeout(() => { isSyncingRef.current = false; }, 600);
      }
    });
    return () => cleanup();
  }, [playerReady, playerRef, isVideoLoading]);

  // Listen for sync_time events (periodic time sync from host)
  useEffect(() => {
    const cleanup = socketService.onSyncTime(({ time, isPlaying: syncIsPlaying, senderId }) => {
      console.log("Sync time received:", { time, isPlaying: syncIsPlaying, senderId });
      
      // Skip if event is from self
      if (senderId === socketService.getSocketId()) {
        return;
      }
      
      // Don't sync while video is loading
      if (isVideoLoading) {
        return;
      }
      
      setIsPlaying(syncIsPlaying);
      setCurrentTime(time);
      
      if (playerRef.current && playerReady) {
        isSyncingRef.current = true;
        try {
          playerRef.current.seekTo(time);
          if (syncIsPlaying) {
            playerRef.current.play(time);
          } else {
            playerRef.current.pause();
          }
        } catch (e) {
          console.error("Error syncing time:", e);
        }
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });
    return () => cleanup();
  }, [playerReady, playerRef, isVideoLoading]);

  // Local timer to update time display for participants (read-only, no socket events)
  // This updates the UI timeline while video is playing
  useEffect(() => {
    // Only for participants/viewers who are syncing (not for host/moderator who control)
    if (myRole === "Host" || myRole === "Moderator") {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && playerReady) {
      // Update time every second while playing
      intervalId = setInterval(() => {
        setCurrentTime((prevTime: number) => {
          // Get actual time from player if available
          if (playerRef.current) {
            try {
              return playerRef.current.getCurrentTime() || prevTime + 1;
            } catch {
              return prevTime + 1;
            }
          }
          return prevTime + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, playerReady, myRole, playerRef]);

  // Listen for change_video events
  useEffect(() => {
    const cleanup = socketService.onChangeVideo(({ videoId }) => {
      console.log("Change video event received:", videoId);
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
      }
    });
    return () => cleanup();
  }, [playerRef]);

  const handlePlay = useCallback(() => {
    if (!myRole || (myRole !== "Host" && myRole !== "Moderator")) {
      console.log("No permission to play, myRole:", myRole);
      return;
    }
    const time = playerRef.current?.getCurrentTime() || 0;
    console.log("handlePlay called, time:", time);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
      playerRef.current.playVideo();
    }
    socketService.play(roomId || "", time);
    setIsPlaying(true);
    setCurrentTime(time);
  }, [myRole, playerRef, roomId]);

  const handlePause = useCallback(() => {
    if (!myRole || (myRole !== "Host" && myRole !== "Moderator")) {
      console.log("No permission to pause, myRole:", myRole);
      return;
    }
    console.log("handlePause called");
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    socketService.pause(roomId || "");
    setIsPlaying(false);
  }, [myRole, playerRef, roomId]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (myRole !== "Host" && myRole !== "Moderator") return;
    const time = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
    socketService.seek(roomId || "", time);
    setCurrentTime(time);
  }, [myRole, playerRef, roomId]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    currentTime,
    duration,
    isPlaying,
    playerReady,
    isSyncingRef,
    handlePlay,
    handlePause,
    handleSeek,
    formatTime,
    setPlayerReady,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsVideoLoading,
  };
}
