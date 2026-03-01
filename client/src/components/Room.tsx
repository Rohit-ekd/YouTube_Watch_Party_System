import React, { useState, RefObject } from "react";
import YouTubePlayer, { YouTubePlayerRef } from "./YouTubePlayer";
import Chat from "./Chat";
import Participants from "./Participants";
import { Room as RoomType, Participant, ChatMessage } from "../types";
import socketService from "../services/socket";

interface RoomProps {
  room: RoomType | null;
  roomId: string;
  username: string;
  myRole: Participant["role"] | undefined;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (input: string) => void;
  onSendChatMessage: () => void;
  chatEndRef: RefObject<HTMLDivElement>;
  onLeave: () => void;
  playerRef: RefObject<YouTubePlayerRef>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playerReady: boolean;
  onPlayerReady: (player: any) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (seconds: number) => string;
  onVideoLoading?: (loading: boolean) => void;
  onDurationChange?: (duration: number) => void;
}

const Room: React.FC<RoomProps> = ({
  room,
  roomId,
  username,
  myRole,
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChatMessage,
  chatEndRef,
  onLeave,
  playerRef,
  currentTime,
  duration,
  isPlaying,
  onPlayerReady,
  onPlay,
  onPause,
  onSeek,
  formatTime,
  onVideoLoading,
  onDurationChange,
}) => {
  const [videoUrl, setVideoUrl] = useState("");

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const changeVideo = () => {
    const id = extractVideoId(videoUrl);
    if (!id) return alert("Invalid YouTube link");
    socketService.changeVideo(room?.roomId || roomId, id);
    setVideoUrl("");
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}?room=${room?.roomId || roomId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Meeting link copied to clipboard!");
  };

  return (
    <div className="relative w-full max-w-7xl mx-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl">
            <span className="text-2xl">🎬</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">YouTube Party</h1>
            <p className="text-white/60 text-sm">Meeting ID: {room?.roomId || roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={shareRoom}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all"
          >
            Copy Link
          </button>
          <button 
            onClick={onLeave}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col lg:flex-row gap-6">

        {/* LEFT SIDE - VIDEO */}
        <div className="flex-1">
          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
            {room?.videoId ? (
              <>
                <YouTubePlayer
                  ref={playerRef}
                  videoId={room.videoId}
                  onReady={onPlayerReady}
                  onVideoLoading={onVideoLoading}
                  onDurationChange={onDurationChange}
                  onPlay={(time: number) => {
                    if (myRole === "Host" || myRole === "Moderator") {
                      socketService.play(room?.roomId || roomId, time);
                    }
                  }}
                  onPause={() => {
                    if (myRole === "Host" || myRole === "Moderator") {
                      socketService.pause(room?.roomId || roomId);
                    }
                  }}
                  onSeek={(time: number) => {
                    if (myRole === "Host" || myRole === "Moderator") {
                      socketService.seek(room?.roomId || roomId, time);
                    }
                  }}
                />
                {/* Custom Controls - Only for Host/Moderator */}
                {(myRole === "Host" || myRole === "Moderator") && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={isPlaying ? onPause : onPlay}
                        className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Seek Slider */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-white text-sm min-w-[40px]">{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={onSeek}
                          className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-white text-sm min-w-[40px]">{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* View-only progress bar for non-Host/Moderator */}
                {myRole !== "Host" && myRole !== "Moderator" && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-xs min-w-[40px]">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 transition-all duration-300"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-xs min-w-[40px]">{formatTime(duration)}</span>
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
              </>
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Waiting for Host to play a video</h3>
                <p className="text-white/60">The host will share a YouTube link soon...</p>
              </div>
            )}
          </div>

          {/* Show YouTube link input ONLY for Host/Moderator */}
          {(myRole === "Host" || myRole === "Moderator") && (
            <div className="mt-4 flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  className="w-full p-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Paste YouTube link..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && changeVideo()}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">🔗</span>
              </div>

              <button
                onClick={changeVideo}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              >
                Play Video ▶
              </button>
            </div>
          )}

          {/* Show message for regular participants */}
          {myRole !== "Host" && myRole !== "Moderator" && room?.videoId && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl text-white/60 text-sm text-center">
              🔒 Only Host and Moderators can control playback
            </div>
          )}

          <div className="mt-4 p-3 bg-white/5 rounded-xl text-white/60 text-sm text-center">
            Logged in as: <span className="font-bold text-pink-400">{username}</span> | Role: <span className="font-bold text-yellow-400">{myRole || "Loading..."}</span>
          </div>
        </div>

        {/* RIGHT SIDE - CHAT & PARTICIPANTS */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <Chat
            messages={chatMessages}
            input={chatInput}
            onInputChange={onChatInputChange}
            onSend={onSendChatMessage}
            chatEndRef={chatEndRef}
          />

          <Participants
            participants={room?.participants || []}
            myRole={myRole}
            mySocketId={socketService.getSocketId()}
            roomId={room?.roomId || roomId}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
