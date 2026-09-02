import "dotenv/config";


import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";

import dns from "dns"
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
])

// import dns from "dns";

// dns.setServers([
//   "10.81.128.153"
// ]);

const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

server.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  
});
