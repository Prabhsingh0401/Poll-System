import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import pollRoutes from "./routes/pollRoutes.js";
import { connectDB } from "./db.js";
import SocketHandler from "./handlers/socketHandler.js";
import PollSocketHandler from "./handlers/pollSocketHandler.js";
import StateManager from "./handlers/stateManager.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

app.use(cors());
app.use(express.json());
app.use("/api/polls", pollRoutes);

// Initialize managers
const stateManager = new StateManager();
const socketHandler = new SocketHandler(io);
const pollSocketHandler = new PollSocketHandler(
  io,
  socketHandler,
  stateManager,
);

setInterval(() => {
  io.emit("ping", { time: new Date().toISOString() });
  console.log(`Ping sent to ${io.engine.clientsCount} clients`);
}, 10000);

// Broadcast poll time every second
setInterval(() => {
  const activePoll = stateManager.getActivePoll();
  if (activePoll) {
    const elapsed = (Date.now() - activePoll.startTime) / 1000;
    const remaining = Math.max(0, Math.ceil(activePoll.duration - elapsed));
    io.emit("pollTimeUpdate", remaining);
  }
}, 1000);

const emitStats = () => {
  const activePoll = stateManager.getActivePoll();
  const responseCount = activePoll
    ? Object.keys(activePoll.responses).length
    : 0;
  const stats = socketHandler.getStats(responseCount);
  io.emit("stats", stats);
};

const broadcastCurrentPoll = () => {
  const activePoll = stateManager.getActivePoll();
  if (activePoll) {
    console.log(`Broadcasting current poll to all clients`);
    pollSocketHandler.broadcastCurrentPoll({
      emit: (event, data) => io.emit(event, data),
    });
  }
};

const broadcastStudentList = () => {
  pollSocketHandler.broadcastStudentList();
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Broadcast current poll to new connection
  const activePoll = stateManager.getActivePoll();
  if (activePoll) {
    console.log(`Sending active poll to new client ${socket.id}`);
    pollSocketHandler.broadcastCurrentPoll(socket);
  }

  socket.on("requestDebug", () => {
    socket.emit("debugInfo", {
      socketId: socket.id,
      activePoll: stateManager.getActivePoll(),
      connectedClients: io.engine.clientsCount,
      yourRole: socketHandler.getUserRole(socket.id) || "unknown",
      studentNames: socketHandler.getConnectedStudents(),
    });
  });

  socket.on("join", (data) => {
    console.log(`Client ${socket.id} joined as ${data.role}`, data);

    // Handle user join
    socketHandler.handleUserJoin(socket.id, data);

    if (data.role === "student") {
      const students = socketHandler.getConnectedStudents();
      Object.keys(socketHandler.userRoles).forEach((id) => {
        if (socketHandler.isTeacher(id)) {
          io.to(id).emit("studentJoined", data.name);
        }
      });
    } else if (data.role === "teacher") {
      const students = socketHandler.getConnectedStudents();
      socket.emit("studentList", students);
    }

    // Broadcast current poll to new user
    if (activePoll) {
      const elapsed = (Date.now() - activePoll.startTime) / 1000;
      const remaining = Math.max(0, Math.ceil(activePoll.duration - elapsed));
      console.log(
        `JOIN EVENT: Sending poll to ${socket.id}. Duration: ${activePoll.duration}s, Elapsed: ${elapsed.toFixed(1)}s, Sending Remaining: ${remaining}s`,
      );
      socket.emit("pollCreated", { ...activePoll, duration: remaining });
    } else {
      socket.emit("noActivePoll");
    }

    emitStats();
  });

  socket.on("requestStudentList", () => {
    pollSocketHandler.handleRequestStudentList(socket);
  });

  // Register all poll socket listeners
  pollSocketHandler.registerListeners(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    socketHandler.handleUserDisconnect(socket.id);

    // Notify teachers of student departure
    const role = socketHandler.getUserRole(socket.id);
    if (role && role.role === "student" && role.name) {
      const students = socketHandler.getConnectedStudents();
      const teacherSockets = Object.keys(socketHandler.userRoles).filter((id) =>
        socketHandler.isTeacher(id),
      );

      teacherSockets.forEach((id) => {
        io.to(id).emit("studentLeft", role.name);
        io.to(id).emit("studentList", students);
      });
    }

    emitStats();
  });
});

const PORT = process.env.PORT || 3000;

// Start server and connect to MongoDB
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default server;
