import { useState, useRef } from "react";
import { useAuth } from "./hooks/useAuth";
import { useRoom } from "./hooks/useRoom";
import { useChat } from "./hooks/useChat";
import { useVideo } from "./hooks/useVideo";
import { YouTubePlayerRef } from "./components/YouTubePlayer";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Room from "./components/Room";
import { View } from "./types";

function App() {
  // Auth State
  const [currentView, setCurrentView] = useState<View>("login");
  const { 
    currentUser, 
    email, 
    password, 
    username, 
    confirmPassword, 
    authError,
    setEmail,
    setPassword,
    setUsername,
    setConfirmPassword,
    handleSignUp,
    handleLogin,
    handleLogout
  } = useAuth();

  // Room State
  const { 
    room, 
    roomId, 
    joinRoomId, 
    setRoomId, 
    setJoinRoomId, 
    createRoom, 
    joinRoom, 
    leaveRoom,
    myRole 
  } = useRoom();

  // Chat State
  const { 
    chatMessages, 
    chatInput, 
    setChatInput, 
    sendChatMessage,
    chatEndRef 
  } = useChat();

  // Video State
  const playerRef = useRef<YouTubePlayerRef>(null);
  const effectiveRoomId = room?.roomId || roomId;
  
  const {
    currentTime,
    duration,
    isPlaying,
    playerReady,
    handlePlay,
    handlePause,
    handleSeek,
    formatTime,
    setPlayerReady,
    setDuration,
    setIsVideoLoading,
  } = useVideo({
    playerRef,
    roomId: effectiveRoomId,
    myRole,
  });

  const handlePlayerReady = (player: any) => {
    console.log("Player ready");
    setPlayerReady(true);
  };

  const handleDurationChange = (dur: number) => {
    console.log("Duration changed:", dur);
    setDuration(dur);
  };

  const handleCreateRoom = () => {
    if (currentUser) {
      createRoom(currentUser.username);
      setCurrentView("room");
    }
  };

  const handleJoinRoom = () => {
    if (currentUser) {
      joinRoom(currentUser.username);
      setCurrentView("room");
    }
  };

  const handleLeave = () => {
    if (currentUser) {
      leaveRoom(currentUser.username);
      handleLogout();
      setCurrentView("login");
    }
  };

  const handleSendChat = () => {
    if (currentUser && effectiveRoomId) {
      sendChatMessage(currentUser.username, effectiveRoomId);
    }
  };

  // Background styles
  const backgroundStyle = "min-h-screen flex items-center justify-center relative overflow-hidden";
  const gradientBg = "absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900";
  const gradientOverlay = "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent";
  const orb1 = "absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse";
  const orb2 = "absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000";
  const orb3 = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500";

  return (
    <div className={backgroundStyle}>
      <div className={gradientBg}></div>
      <div className={gradientOverlay}></div>
      <div className={orb1}></div>
      <div className={orb2}></div>
      <div className={orb3}></div>

      {/* LOGIN PAGE */}
      {currentView === "login" && (
        <Login
          email={email}
          password={password}
          authError={authError}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={() => {
            handleLogin();
            setCurrentView("dashboard");
          }}
          onSwitchToSignup={() => {
            setCurrentView("signup");
            setEmail("");
            setPassword("");
          }}
        />
      )}

      {/* SIGNUP PAGE */}
      {currentView === "signup" && (
        <Signup
          username={username}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          authError={authError}
          onUsernameChange={setUsername}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSignUp={() => {
            handleSignUp();
            setCurrentView("dashboard");
          }}
          onSwitchToLogin={() => {
            setCurrentView("login");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }}
        />
      )}

      {/* DASHBOARD PAGE */}
      {currentView === "dashboard" && currentUser && (
        <Dashboard
          username={currentUser.username}
          roomId={roomId}
          joinRoomId={joinRoomId}
          onRoomIdChange={setRoomId}
          onJoinRoomIdChange={setJoinRoomId}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onLogout={() => {
            handleLogout();
            setCurrentView("login");
          }}
        />
      )}

      {/* ROOM PAGE */}
      {currentView === "room" && currentUser && (
        <Room
          room={room}
          roomId={effectiveRoomId}
          username={currentUser.username}
          myRole={myRole}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendChatMessage={handleSendChat}
          chatEndRef={chatEndRef}
          onLeave={handleLeave}
          playerRef={playerRef}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          playerReady={playerReady}
          onPlayerReady={handlePlayerReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          formatTime={formatTime}
          onVideoLoading={setIsVideoLoading}
          onDurationChange={handleDurationChange}
        />
      )}
    </div>
  );
}

export default App;
