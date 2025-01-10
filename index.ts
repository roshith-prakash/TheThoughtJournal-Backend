import http from "http";
import express, { Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
dotenv.config();

// Importing Routes ----------------------------------------------------------------------------------------------

import authRouter from "./routes/auth.routes.ts";
import postRouter from "./routes/post.routes.ts";
import userRouter from "./routes/user.routes.ts";

// Initializing Server -------------------------------------------------------------------------------------------

const app = express();
let server = http.createServer(app);

// Using Middleware -------------------------------------------------------------------------------------------

// Whitelist for domains
const whitelist = [
  "http://localhost:3000",
  "https://thethoughtjournal.vercel.app",
  "*",
];

// Function to deny access to domains except those in whitelist.
const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Find request domain and check in whitelist.
    if (origin && whitelist.indexOf(origin) !== -1) {
      // Accept request
      callback(null, true);
    } else {
      // Send CORS error.
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Parses request body.
app.use(express.urlencoded({ extended: true }));
// Parses JSON passed inside body.
app.use(express.json());
// Enable CORS
app.use(cors());
// Add security to server.
app.use(helmet());

// Routes -------------------------------------------------------------------------------------------

// Default route to check if server is working.
app.get("/", (_, res: Response) => {
  res.status(200).send("We are good to go!");
});

// Routes -----------------------------------------------------------------------------------------

// Auth Routes
app.use("/auth", authRouter);

// Post Routes
app.use("/post", postRouter);

// User Routes
app.use("/user", userRouter);

// Listening on PORT -------------------------------------------------------------------------------------------

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
