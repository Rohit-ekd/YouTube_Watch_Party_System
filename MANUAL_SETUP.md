

## Prerequisites
- Node.js (v18+) installed
- MongoDB (local or Atlas) installed

## Step 1: Install Server Dependencies

Open a new terminal and run:

```
bash
cd "C:\Users\rv268\OneDrive\Desktop\Web3Task Assignment\youtube 3.0 party\server"
npm install
```

## Step 2: Install Client Dependencies

Open a new terminal and run:

```
bash
cd "C:\Users\rv268\OneDrive\Desktop\Web3Task Assignment\youtube 3.0 party\client"
npm install
```

## Step 3: Configure Environment

Create a `.env` file in the `server` folder:

```
env
PORT=5000
MONGO_URI=mongodb+srv://rv2685602_db_user:Rohit%40123@cluster0.sogtedj.mongodb.net/?appName=Cluster0
```

## Step 4: Start the Server

```
bash
cd "C:\Users\rv268\OneDrive\Desktop\Web3Task Assignment\youtube 3.0 party\server"
npm run dev
```

The server will start on http://localhost:5000

## Step 5: Start the Client

Open a new terminal and run:

```
bash
cd "C:\Users\rv268\OneDrive\Desktop\Web3Task Assignment\youtube 3.0 party\client"
npm run dev
```

The client will start on http://localhost:3000

## How to Use

1. Open http://localhost:3000 in your browser
2. Enter a Room ID (e.g., "party1") and Username
3. Click "Join Party 🚀"
4. As the Host, paste a YouTube video link in the input field and click "Play Video ▶"
5. Share the room URL with friends to watch together!

## Alternative: Run with npm scripts

Instead of `npm run dev`, you can use:

```
bash
# Build for production (client)
npm run build

# Start production server
npm start
