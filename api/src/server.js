import { connectDb } from "./utils/db.connection.js";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import tenateRoutes from "./routes/tenancy.route.js";
import chatRoutes from "./routes/chat.route.js";

import { initSocket } from "./socket/index.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use((req, _res, next) => {
    req.io = io;
    next();
});

initSocket(io);

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("running");
});

await connectDb();

app.use("/api/auth", authRoute);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tenants", tenateRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 2000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});