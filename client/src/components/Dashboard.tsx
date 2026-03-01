import React from "react";

interface DashboardProps {
  username: string;
  roomId: string;
  joinRoomId: string;
  onRoomIdChange: (roomId: string) => void;
  onJoinRoomIdChange: (joinRoomId: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  username,
  roomId,
  joinRoomId,
  onRoomIdChange,
  onJoinRoomIdChange,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-2xl">
              <span className="text-3xl">🎬</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">YouTube Party</h1>
              <p className="text-white/60">Welcome back, {username}!</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all"
          >
            Logout
          </button>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <h2 className="text-2xl font-bold text-white mb-2">Host a Party</h2>
            <p className="text-white/60 mb-6">Create a new room and invite others to watch together</p>
            
            <div className="space-y-4">
              <input
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Meeting ID (optional)"
                value={roomId}
                onChange={(e) => onRoomIdChange(e.target.value.toUpperCase())}
              />
              <button
                onClick={onCreateRoom}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 p-3 rounded-xl font-semibold transition-all"
              >
                 Create Room
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <h2 className="text-2xl font-bold text-white mb-2">Join a Party</h2>
            <p className="text-white/60 mb-6">Enter a meeting ID to join an existing room</p>
            
            <div className="space-y-4">
              <input
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter Meeting ID"
                value={joinRoomId}
                onChange={(e) => onJoinRoomIdChange(e.target.value.toUpperCase())}
              />
              <button
                onClick={onJoinRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 p-3 rounded-xl font-semibold transition-all"
              >
                🔗 Join Room
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 p-4 bg-white/5 rounded-xl text-center">
          <p className="text-white/60">
            Logged in as: <span className="text-pink-400 font-bold">{username}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
