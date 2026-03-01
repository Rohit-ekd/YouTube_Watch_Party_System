import { useState, useCallback, useEffect } from "react";
import { Room, Participant } from "../types";
import socketService from "../services/socket";

export interface UseRoomReturn {
  room: Room | null;
  roomId: string;
  joinRoomId: string;
  setRoomId: (roomId: string) => void;
  setJoinRoomId: (joinRoomId: string) => void;
  createRoom: (username: string) => void;
  joinRoom: (username: string) => void;
  leaveRoom: (username: string) => void;
  myRole: Participant["role"] | undefined;
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  // Check for room ID in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl) {
      setJoinRoomId(roomFromUrl);
    }
  }, []);

  // Listen for room updates
  useEffect(() => {
    const cleanup = socketService.onRoomUpdated((updatedRoom) => {
      setRoom(updatedRoom);
    });
    return () => cleanup();
  }, []);

  // Listen for removed events
  useEffect(() => {
    const cleanup = socketService.onRemoved((data) => {
      alert(data.message);
      setRoom(null);
      setRoomId("");
      setJoinRoomId("");
    });
    return () => cleanup();
  }, []);

  // Listen for change_video events to update room state
  useEffect(() => {
    const cleanup = socketService.onChangeVideo(({ videoId }) => {
      setRoom((prevRoom) => {
        if (prevRoom) {
          return { ...prevRoom, videoId };
        }
        return prevRoom;
      });
    });
    return () => cleanup();
  }, []);

  const generateRoomId = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const createRoom = useCallback((username: string) => {
    const newRoomId = roomId || generateRoomId();
    setRoomId(newRoomId);
    socketService.joinRoom(newRoomId, username);
    setTimeout(() => {
      socketService.userJoined(newRoomId, username);
    }, 500);
    setRoom({
      roomId: newRoomId,
      videoId: "",
      isPlaying: false,
      currentTime: 0,
      participants: [],
    });
  }, [roomId, generateRoomId]);

  const joinRoom = useCallback((username: string) => {
    if (!joinRoomId) return;
    socketService.joinRoom(joinRoomId, username);
    // Set initial room state for joining
    setRoom({
      roomId: joinRoomId,
      videoId: "",
      isPlaying: false,
      currentTime: 0,
      participants: [],
    });
    setRoomId(joinRoomId);
    setTimeout(() => {
      socketService.userJoined(joinRoomId, username);
    }, 500);
  }, [joinRoomId]);

  const leaveRoom = useCallback((username: string) => {
    if (room?.roomId) {
      socketService.userLeft(room.roomId, username);
      socketService.leaveRoom(room.roomId);
    }
    setRoom(null);
    setRoomId("");
    setJoinRoomId("");
  }, [room]);

  const myRole = room?.participants.find(
    (p) => p.socketId === socketService.getSocketId()
  )?.role;

  return {
    room,
    roomId,
    joinRoomId,
    setRoomId,
    setJoinRoomId,
    createRoom,
    joinRoom,
    leaveRoom,
    myRole,
  };
}
