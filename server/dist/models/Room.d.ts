import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IRoom, {}, {}, {}, mongoose.Document<unknown, {}, IRoom, {}, {}> & IRoom & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Room.d.ts.map