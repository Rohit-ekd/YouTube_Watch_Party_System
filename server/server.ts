import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// In-memory storage
interface Participant {
  socketId: string;
  username: string;
  role: "Host" | "Moderator" | "Participant" | "Viewer";
}

interface Room {
  roomId: string;
  hostSocketId: string;
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
}

const rooms = new Map<string, Room>();

/* ---------------- ROLE PERMISSIONS ---------------- */

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Host: [
    "play",
    "pause",
    "seek",
    "change_video",
    "assign_role",
    "remove_participant",
    "transfer_host"
  ],
  Moderator: ["play", "pause", "seek", "change_video"],
  Participant: ["play", "pause", "seek", "change_video"],
  Viewer: ["play", "pause", "seek", "change_video"]
};

const hasPermission = (
  roomId: string,
  socketId: string,
  action: string
): boolean => {
  const room = rooms.get(roomId);
  if (!room) return false;

  const user = room.participants.find(
    (p) => p.socketId === socketId
  );

  if (!user) return false;

  return ROLE_PERMISSIONS[user.role]?.includes(action) || false;
};

/* ---------------- SOCKET EVENTS ---------------- */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  /* -------- JOIN ROOM -------- */

  socket.on("join_room", async ({ roomId, username }) => {

    socket.join(roomId);

    let room = rooms.get(roomId);

    if (!room) {
      room = {
        roomId,
        hostSocketId: socket.id,
        videoId: "",
        isPlaying: false,
        currentTime: 0,
        participants: []
      };
      rooms.set(roomId, room);
    }

    const role = room.hostSocketId === socket.id ? "Host" : "Participant";

    room.participants.push({
      socketId: socket.id,
      username,
      role
    });

    // Send sync_state to the new user
    socket.emit("sync_state", {
      playState: room.isPlaying,
      currentTime: room.currentTime,
      videoId: room.videoId
    });

    io.to(roomId).emit("room_updated", room);
  });

  /* -------- LEAVE ROOM -------- */

  socket.on("leave_room", async ({ roomId }) => {
    socket.leave(roomId);

    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(
      (p) => p.socketId !== socket.id
    );

    // If host left, assign new host or delete room
    if (room.hostSocketId === socket.id) {
      if (room.participants.length > 0) {
        room.hostSocketId = room.participants[0].socketId;
        room.participants[0].role = "Host";
      } else {
        rooms.delete(roomId);
        return;
      }
    }

    io.to(roomId).emit("room_updated", room);
  });

  /* -------- PLAY -------- */

  socket.on("play", async ({ roomId, time, senderId }) => {

    if (!hasPermission(roomId, socket.id, "play")) {
      socket.emit("error", { message: "You don't have permission to play" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.isPlaying = true;
    room.currentTime = time;

    // Use socket.to to broadcast to all EXCEPT sender - prevents infinite loop
    socket.to(roomId).emit("play", { time, senderId: socket.id });
  });

  /* -------- PAUSE -------- */

  socket.on("pause", async ({ roomId, senderId }) => {

    if (!hasPermission(roomId, socket.id, "pause")) {
      socket.emit("error", { message: "You don't have permission to pause" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.isPlaying = false;

    // Use socket.to to broadcast to all EXCEPT sender - prevents infinite loop
    socket.to(roomId).emit("pause", { senderId: socket.id });
  });

  /* -------- SEEK -------- */

  socket.on("seek", async ({ roomId, time, senderId }) => {

    if (!hasPermission(roomId, socket.id, "seek")) {
      socket.emit("error", { message: "You don't have permission to seek" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.currentTime = time;

    // Use socket.to to broadcast to all EXCEPT sender - prevents infinite loop
    socket.to(roomId).emit("seek", { time, senderId: socket.id });
  });

  /* -------- SYNC TIME (periodic) -------- */

  socket.on("sync_time", async ({ roomId, time, isPlaying, senderId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentTime = time;
    room.isPlaying = isPlaying;

    // Broadcast to all other clients (not sender)
    socket.to(roomId).emit("sync_time", { time, isPlaying, senderId: socket.id });
  });

  /* -------- CHANGE VIDEO -------- */

  socket.on("change_video", async ({ roomId, videoId }) => {
    console.log("change_video event received:", { roomId, videoId, socketId: socket.id });

    if (!hasPermission(roomId, socket.id, "change_video")) {
      console.log("Permission denied for change_video:", socket.id);
      socket.emit("error", { message: "You don't have permission to change video" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.videoId = videoId;

    console.log("Emitting change_video to room:", roomId, videoId);
    io.to(roomId).emit("change_video", { videoId });
  });

  /* -------- CHAT MESSAGE -------- */

  socket.on("chat_message", async ({ roomId, id, username, message, timestamp }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Broadcast to all users in the room including sender
    io.to(roomId).emit("chat_message", { 
      id, 
      username, 
      message, 
      timestamp,
      socketId: socket.id 
    });
  });

  /* -------- USER JOINED (for notifications) -------- */

  socket.on("user_joined", async ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    io.to(roomId).emit("user_joined", { 
      username,
      socketId: socket.id,
      message: `${username} joined the room`
    });
  });

  /* -------- USER LEFT (for notifications) -------- */

  socket.on("user_left", async ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    io.to(roomId).emit("user_left", { 
      username,
      socketId: socket.id,
      message: `${username} left the room`
    });
  });

  /* -------- ASSIGN ROLE -------- */

  socket.on("assign_role", async ({ roomId, targetId, role }) => {

    if (!hasPermission(roomId, socket.id, "assign_role")) {
      socket.emit("error", { message: "You don't have permission to assign roles" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.participants.forEach((p) => {
      if (p.socketId === targetId) {
        p.role = role;
      }
    });

    io.to(roomId).emit("room_updated", room);
  });

  /* -------- REMOVE PARTICIPANT -------- */

  socket.on("remove_participant", async ({ roomId, targetId }) => {

    if (!hasPermission(roomId, socket.id, "remove_participant")) {
      socket.emit("error", { message: "You don't have permission to remove participants" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(
      (p) => p.socketId !== targetId
    );

    io.to(targetId).emit("removed", { message: "You have been removed from the room" });
    io.to(roomId).emit("room_updated", room);
  });

  /* -------- TRANSFER HOST -------- */

  socket.on("transfer_host", async ({ roomId, targetId }) => {

    if (!hasPermission(roomId, socket.id, "transfer_host")) {
      socket.emit("error", { message: "You don't have permission to transfer host" });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.hostSocketId = targetId;

    room.participants.forEach((p) => {
      if (p.socketId === targetId) {
        p.role = "Host";
      } else if (p.socketId === socket.id) {
        p.role = "Participant";
      }
    });

    io.to(roomId).emit("room_updated", room);
  });

  /* -------- DISCONNECT -------- */

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    
    // Find room where user was participant
    for (const [roomId, room] of rooms.entries()) {
      const participantIndex = room.participants.findIndex(
        (p) => p.socketId === socket.id
      );

      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);

        // If host left, assign new host or delete room
        if (room.hostSocketId === socket.id) {
          if (room.participants.length > 0) {
            room.hostSocketId = room.participants[0].socketId;
            room.participants[0].role = "Host";
          } else {
            rooms.delete(roomId);
            continue;
          }
        }

        io.to(roomId).emit("room_updated", room);
      }
    }
  });

});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

