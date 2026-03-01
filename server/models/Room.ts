import mongoose, { Document, Schema } from "mongoose";

export interface IParticipant {
  socketId: string;
  username: string;
  role: "Host" | "Moderator" | "Participant" | "Viewer";
}

export interface IRoom extends Document {
  roomId: string;
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  hostSocketId: string;
  participants: IParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  socketId: { type: String, required: true },
  username: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["Host", "Moderator", "Participant", "Viewer"],
    default: "Participant" 
  }
}, { _id: false });

const RoomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  videoId: { type: String, default: "dQw4w9WgXcQ" },
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  hostSocketId: { type: String, required: true },
  participants: [ParticipantSchema]
}, { timestamps: true });

export default mongoose.model<IRoom>("Room", RoomSchema);
