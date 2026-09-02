import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!validator.isEmail(email || "")) return res.status(400).json({ success: false, message: "Valid email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions());

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

export function logout(_req, res) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, message: "Logged out" });
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}
