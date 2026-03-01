import React from "react";
import { Participant } from "../types";
import socketService from "../services/socket";

interface ParticipantsProps {
  participants: Participant[];
  myRole: Participant["role"] | undefined;
  mySocketId: string | undefined;
  roomId: string;
}

const Participants: React.FC<ParticipantsProps> = ({
  participants,
  myRole,
  mySocketId,
  roomId,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Host":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black";
      case "Moderator":
        return "bg-gradient-to-r from-purple-400 to-pink-500 text-white";
      case "Participant":
        return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const handleAssignRole = (targetId: string, role: string) => {
    socketService.assignRole(roomId, targetId, role);
  };

  const handleRemoveParticipant = (targetId: string) => {
    socketService.removeParticipant(roomId, targetId);
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
           Participants
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
            {participants.length}
          </span>
        </h3>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {participants.map((p) => (
          <div
            key={p.socketId}
            className="bg-white/10 p-3 rounded-xl transition-all hover:bg-white/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{p.username}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(p.role)}`}>
                    {p.role}
                  </span>
                </div>
              </div>
            </div>

            {myRole === "Host" && p.socketId !== mySocketId && (
              <div className="mt-2 flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleAssignRole(p.socketId, "Moderator")}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                >
                  ⚡ Moderator
                </button>

                <button
                  onClick={() => handleRemoveParticipant(p.socketId)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Participants;
