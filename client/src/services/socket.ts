import { io, Socket } from "socket.io-client";
import { Room, ChatMessage, SyncState } from "../types";

const SOCKET_URL = "http://localhost:5000";

class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL);
    this.setupConnection();
  }

  private setupConnection() {
    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket.id);
    });

    this.socket.on("error", (data: { message: string }) => {
      console.log("Socket error:", data.message);
      alert(data.message);
    });
  }

  getSocket() {
    return this.socket;
  }

  getSocketId() {
    return this.socket.id;
  }

  // Room Events
  joinRoom(roomId: string, username: string) {
    this.socket.emit("join_room", { roomId, username });
  }

  leaveRoom(roomId: string) {
    this.socket.emit("leave_room", { roomId });
  }

  // Video Events
  play(roomId: string, time: number) {
    this.socket.emit("play", { roomId, time, senderId: this.socket.id });
  }

  pause(roomId: string) {
    this.socket.emit("pause", { roomId, senderId: this.socket.id });
  }

  seek(roomId: string, time: number) {
    this.socket.emit("seek", { roomId, time, senderId: this.socket.id });
  }

  syncTime(roomId: string, time: number, isPlaying: boolean) {
    this.socket.emit("sync_time", { roomId, time, isPlaying, senderId: this.socket.id });
  }

  changeVideo(roomId: string, videoId: string) {
    this.socket.emit("change_video", { roomId, videoId });
  }

  // Chat Events
  sendChatMessage(roomId: string, message: ChatMessage) {
    this.socket.emit("chat_message", { roomId, ...message });
  }

  // User Events
  userJoined(roomId: string, username: string) {
    this.socket.emit("user_joined", { roomId, username });
  }

  userLeft(roomId: string, username: string) {
    this.socket.emit("user_left", { roomId, username });
  }

  // Role Management
  assignRole(roomId: string, targetId: string, role: string) {
    this.socket.emit("assign_role", { roomId, targetId, role });
  }

  removeParticipant(roomId: string, targetId: string) {
    this.socket.emit("remove_participant", { roomId, targetId });
  }

  transferHost(roomId: string, targetId: string) {
    this.socket.emit("transfer_host", { roomId, targetId });
  }

  // Event Listeners - return void for useEffect cleanup
  onRoomUpdated(callback: (room: Room) => void): () => void {
    const handler = (room: Room) => callback(room);
    this.socket.on("room_updated", handler);
    return () => { this.socket.off("room_updated", handler); };
  }

  onSyncState(callback: (data: SyncState) => void): () => void {
    const handler = (data: SyncState) => callback(data);
    this.socket.on("sync_state", handler);
    return () => { this.socket.off("sync_state", handler); };
  }

  onPlay(callback: (data: { time: number; senderId?: string }) => void): () => void {
    const handler = (data: { time: number; senderId?: string }) => callback(data);
    this.socket.on("play", handler);
    return () => { this.socket.off("play", handler); };
  }

  onPause(callback: (data: { senderId?: string }) => void): () => void {
    const handler = (data: { senderId?: string }) => callback(data);
    this.socket.on("pause", handler);
    return () => { this.socket.off("pause", handler); };
  }

  onSeek(callback: (data: { time: number; senderId?: string }) => void): () => void {
    const handler = (data: { time: number; senderId?: string }) => callback(data);
    this.socket.on("seek", handler);
    return () => { this.socket.off("seek", handler); };
  }

  onSyncTime(callback: (data: { time: number; isPlaying: boolean; senderId?: string }) => void): () => void {
    const handler = (data: { time: number; isPlaying: boolean; senderId?: string }) => callback(data);
    this.socket.on("sync_time", handler);
    return () => { this.socket.off("sync_time", handler); };
  }

  onChangeVideo(callback: (data: { videoId: string }) => void): () => void {
    const handler = (data: { videoId: string }) => callback(data);
    this.socket.on("change_video", handler);
    return () => { this.socket.off("change_video", handler); };
  }

  onChatMessage(callback: (message: ChatMessage) => void): () => void {
    const handler = (message: ChatMessage) => callback(message);
    this.socket.on("chat_message", handler);
    return () => { this.socket.off("chat_message", handler); };
  }

  onUserJoined(callback: (data: { username: string; message: string }) => void): () => void {
    const handler = (data: { username: string; message: string }) => callback(data);
    this.socket.on("user_joined", handler);
    return () => { this.socket.off("user_joined", handler); };
  }

  onUserLeft(callback: (data: { username: string; message: string }) => void): () => void {
    const handler = (data: { username: string; message: string }) => callback(data);
    this.socket.on("user_left", handler);
    return () => { this.socket.off("user_left", handler); };
  }

  onRemoved(callback: (data: { message: string }) => void): () => void {
    const handler = (data: { message: string }) => callback(data);
    this.socket.on("removed", handler);
    return () => { this.socket.off("removed", handler); };
  }

  // Cleanup
  disconnect() {
    this.socket.disconnect();
  }

  removeAllListeners() {
    this.socket.removeAllListeners();
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
