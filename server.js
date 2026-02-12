const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const GroupMessage = require("./models/GroupMessage"); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
});

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB successful"))
.catch((err) => console.log("❌ MongoDB failed:", err));

app.get("/api/chat/messages/:room", async (req, res) => {
    try {
        const { room } = req.params;
        const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "server Error" });
    }
});

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`📢 ${socket.id} joined ${room}`);
    });

    // Requirement #6: Leave Room
    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`📢 ${socket.id} left ${room}`);
    });

    // Requirement #9: Typing Indicator
    socket.on("typing", (data) => {
        socket.to(data.room).emit("displayTyping", data);
    });

    socket.on("chatMessage", async ({ from_user, room, message }) => {
        try {
            const newMessage = new GroupMessage({ from_user, room, message, date_sent: new Date() });
            await newMessage.save();
            io.to(room).emit("message", { from_user, message, date_sent: newMessage.date_sent });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Disconnected : ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running at : http://localhost:${PORT}`);
});