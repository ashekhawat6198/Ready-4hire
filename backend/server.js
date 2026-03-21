import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js"
import path from "path";

dotenv.config();

connectDB();

const app = express();

const _dirname=path.resolve();

const server = http.createServer(app);

const allowedOrigin = [
    'https://ready4hire-5di8.onrender.com',
   
]

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE',  'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
})

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization',"X-Requested-With"],
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("io", io);



app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rank",leaderboardRoutes)


io.on("connection", (socket) => {
    console.log(`A user Connected ${socket.id}`);
    const userId=socket.handshake.query.userId;
    if(userId){

        socket.join(userId);
        console.log(`User ${socket.id} joined room: ${userId}`);
    }

    socket.on("disconnect", () => {
        console.log(`User Disconnected ${socket.id}`);
    });
});

app.use(express.static(path.join(_dirname,"/frontend/dist")))
app.get("/{*any}",(_,res)=>{
    res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"))
})

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;




server.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);


