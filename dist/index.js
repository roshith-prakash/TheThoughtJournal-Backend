import http from "http";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { Server } from "socket.io";
dotenv.config();
import authRouter from "./routes/auth.routes.js";
import postRouter from "./routes/post.routes.js";
import userRouter from "./routes/user.routes.js";
const app = express();
let server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://thethoughtjournal.vercel.app"],
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    socket.on("toMaintainConnection", () => {
        socket.emit("maintainReply");
    });
});
const whitelist = [
    "http://localhost:3000",
    "https://thethoughtjournal.vercel.app",
    "https://keep-api-alive.onrender.com",
];
const corsOptions = {
    origin: function (origin, callback) {
        if (origin && whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.get("/", (_, res) => {
    res.status(200).send("We are good to go!");
});
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);
server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
