// Types for the YouTube Party Application

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface Participant {
  socketId: string;
  username: string;
  role: "Host" | "Moderator" | "Participant" | "Viewer";
}

export interface Room {
  roomId: string;
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface SyncState {
  playState: boolean;
  currentTime: number;
  videoId: string;
}

// App Views
export type View = "login" | "signup" | "dashboard" | "room";

// Socket Events
export interface RoomEvents {
  room_updated: (room: Room) => void;
  sync_state: (data: SyncState) => void;
  play: (data: { time: number }) => void;
  pause: () => void;
  seek: (data: { time: number }) => void;
  change_video: (data: { videoId: string }) => void;
  chat_message: (message: ChatMessage) => void;
  user_joined: (data: { username: string; message: string }) => void;
  user_left: (data: { username: string; message: string }) => void;
  error: (data: { message: string }) => void;
  removed: (data: { message: string }) => void;
}
