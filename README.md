# YouTube 3.0 Party

A real-time Watch Party application that allows multiple users to watch YouTube videos together in sync.

## Features

- 🎬 **Real-time synchronization** - All participants see the same video state (play/pause, seek position, current video)
- 🏠 **Room-based model** - Create or join watch rooms with unique links/codes
- 🎥 **YouTube integration** - Play YouTube videos in sync for all room participants
- 🔐 **Role-based access control** - Host, Moderator, Participant, and Viewer roles
- 💬 **Beautiful UI** - Modern glassmorphism design with animations

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Database**: MongoDB with Mongoose

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

2. **Install server dependencies**
   
```
bash
   cd server
   npm install
   
```

3. **Install client dependencies**
   
```
bash
   cd client
   npm install
   
```

4. **Configure environment variables**

   Create a `.env` file in the `server` directory:
   
```
env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/youtube3party
   
```

   Or use MongoDB Atlas:
   
```
env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/youtube3party
   
```

### Running the Application

1. **Start the server**
   
```
bash
   cd server
   npm run dev
   
```
   Server runs on http://localhost:5000

2. **Start the client** (in a new terminal)
   
```
bash
   cd client
   npm run dev
   
```
   Client runs on http://localhost:3000

3. **Open in browser**
   - Create a room by entering a Room ID and Username
   - Share the URL (with `?room=YOUR_ROOM_ID`) with others to join

## Role Permissions

| Role | Permissions |
|------|-------------|
| **Host** | Full control: play/pause, seek, change video, assign roles, remove participants, transfer host |
| **Moderator** | Play/pause, seek, change video |
| **Participant** | Watch only (no controls) |
| **Viewer** | Same as Participant |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join a room |
| `room_updated` | Server → Clients | Room state changed |
| `play` | Client → Server | Play video (requires permission) |
| `pause` | Client → Server | Pause video (requires permission) |
| `seek` | Client → Server | Seek video (requires permission) |
| `change_video` | Client → Server | Change video (requires permission) |
| `assign_role` | Client → Server | Assign role (Host only) |
| `remove_participant` | Client → Server | Remove user (Host only) |

## Deployment

To deploy to production:

1. **Server (Render/Railway)**
   - Build: `npm run build`
   - Start: `npm start`

2. **Client (Vercel/Netlify)**
   - Build: `npm run build`
   - Deploy the `dist` folder

## Screen Shorts
Sign up
<img width="784" height="870" alt="image" src="https://github.com/user-attachments/assets/ab538766-28eb-4eb6-8729-3ae60500b822" />
Sign in
<img width="696" height="726" alt="image" src="https://github.com/user-attachments/assets/6b85600c-430d-4b76-be28-c140dc087295" />
Dashboard Page
<img width="1472" height="825" alt="image" src="https://github.com/user-attachments/assets/2449c0a2-35b7-4290-b7d2-6a7ab8fae062" />
Create Room
<img width="1805" height="881" alt="image" src="https://github.com/user-attachments/assets/9f102c84-22e4-4435-9b98-62f01a2001f1" />


