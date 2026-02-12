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

module.exports = router;
