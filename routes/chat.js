const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const router = express.Router();

router.get("/messages/:room", async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room }).sort("date_sent");
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Failed to load chat messages." });
    }
});
// Add inside your DOMContentLoaded listener
const messageInput = document.getElementById("messageInput");

messageInput.addEventListener("keypress", () => {
    socket.emit("typing", { user: localStorage.getItem("username"), room: localStorage.getItem("room") });
});

socket.on("displayTyping", (data) => {
    let typingDiv = document.getElementById("typingIndicator");
    typingDiv.innerText = `${data.user} is typing...`;
    setTimeout(() => { typingDiv.innerText = ""; }, 2000);
});
module.exports = router;
