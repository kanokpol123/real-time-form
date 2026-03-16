const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const sessions = {};

  io.on("connection", (socket) => {
    console.log(`[Socket] connected: ${socket.id}`);

    socket.on("patient:field_update", ({ sessionId, field, value }) => {
      if (!sessions[sessionId]) {
        sessions[sessionId] = { status: "filling", fields: {}, lastActivity: Date.now() };
      }
      sessions[sessionId].fields[field] = value;
      sessions[sessionId].lastActivity = Date.now();
      sessions[sessionId].status = "filling";
      socket.to(`staff`).emit("staff:field_update", {
        sessionId, field, value, status: "filling",
      });
    });

    socket.on("patient:submit", ({ sessionId, formData }) => {
      if (sessions[sessionId]) {
        sessions[sessionId].status = "submitted";
        sessions[sessionId].fields = formData;
      }
      socket.to(`staff`).emit("staff:submitted", { sessionId, formData });
    });

    socket.on("patient:status", ({ sessionId, status }) => {
      if (sessions[sessionId]) {
        sessions[sessionId].status = status;
      }
      socket.to(`staff`).emit("staff:status_change", { sessionId, status });
    });

    socket.on("staff:join", () => {
      socket.join("staff");
      socket.emit("staff:snapshot", sessions);
    });

    socket.on("patient:register", ({ sessionId }) => {
      sessions[sessionId] = { status: "filling", fields: {}, lastActivity: Date.now() };
      socket.join(sessionId);
      socket.to("staff").emit("staff:new_session", { sessionId });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] disconnected: ${socket.id}`);
    });
  });

  setInterval(() => {
    const now = Date.now();
    Object.entries(sessions).forEach(([sessionId, session]) => {
      if (session.status === "filling" && now - session.lastActivity > 30000) {
        sessions[sessionId].status = "inactive";
        io.to("staff").emit("staff:status_change", { sessionId, status: "inactive" });
      }
    });
  }, 10000);

  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});