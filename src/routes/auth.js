import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const user = await User.findOne({ username });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
  return res.json({ token, username: user.username });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const user = await User.createUser(username, password);
  const token = jwt.sign(
    { sub: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
  return res.status(201).json({ token, username: user.username });
});

router.post("/logout", (_req, res) => {
  return res.status(200).json({ ok: true });
});

export default router;
