const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Signup API
router.post("/signup", async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        // Check for duplicate username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        // Hash the password
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
        res.status(500).json({ message: "Server error occurred." });
    }
});


// Login API
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Automatically encrypt password if not already hashed
        if (!user.password.startsWith("$2b$")) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
            await user.save();
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, "secretkey", {
            expiresIn: "1h",
        });

        res.json({ token, user: { username: user.username } });
    } catch (err) {
        res.status(500).json({ message: "Server error occurred." });
    }
});

module.exports = router;
