
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const createToken = (userId) => {
    return jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        if (name.trim().length > 50 ||
            email.trim().length > 254 ||
            password.length < 8 ||
            password.length > 72) {
            return res.status(400).json({
                error: "Name or email is too long, or password must be 8–72 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = createToken(user._id);

        res.cookie("nexora_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        console.error("Registration error:", error.message);
        return res.status(500).json({
            error: "Registration failed"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            email.trim().length > 254 ||
            password.length > 72
        ) {
            return res.status(400).json({
                error: "Valid email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        res.cookie("nexora_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            error: "Login failed"
        });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    res.clearCookie("nexora_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/"
    });

    return res.json({
        message: "Logged out successfully"
    });
});

export default router;
