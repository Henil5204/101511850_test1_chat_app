const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const GroupMessage = require("./models/GroupMessage"); // chatting message saving model

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
    },
});

// connect to public html
app.use(express.static(path.join(__dirname, "public")));

// cors and json settings> middle
app.use(cors());
app.use(express.json());

// API route settings
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Mongo DB 
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB successful"))
.catch((err) => console.log("❌ MongoDB failed:", err));



// Chatting messages
app.get("/api/chat/messages/:room", async (req, res) => {
    try {
        const { room } = req.params;
        console.log(`📢 API : /api/chat/messages/${room}`);

        const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 });

        console.log(`Load messages : ${messages.length}`);
        res.json(messages);
    } catch (error) {
        console.error("Errors:", error);
        res.status(500).json({ error: "server Error" });
    }
});

// Socket.io
io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    // join rommie
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`📢 ${socket.id} is showing up ${room} .`);
    });

    //consoles
    socket.on("chatMessage", async ({ from_user, room, message }) => {
        try {
    
            const newMessage = new GroupMessage({ from_user, room, message, date_sent: new Date() });
            await newMessage.save();

            io.to(room).emit("message", { from_user, message, date_sent: newMessage.date_sent });
        } catch (error) {
            console.error("Error for saving messages:", error);
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
