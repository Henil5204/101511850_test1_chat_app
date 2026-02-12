const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User model
const bcrypt = require("bcrypt");

// Get all users API
router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all user data
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error occurred." });
    }
});

// ✅ User registration (Signup) API (POST /api/users)
router.post("/", async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        // Check for duplicate username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error occurred." });
    }
});

module.exports = router;
