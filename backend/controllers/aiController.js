const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const userModel = require("../models/userModel");

const AVATAR_COLORS = [
  "#14b8a6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#f97316",
];

const respond = (res, code, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(code).json(payload);
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return respond(
        res,
        422,
        false,
        errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      );

    const { name, email, password } = req.body;

    if (await userModel.emailExists(email))
      return respond(
        res,
        409,
        false,
        "An account with that email already exists.",
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarColor =
      AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];
    const user = await userModel.createUser({
      name,
      email,
      hashedPassword,
      avatarColor,
    });
    const token = signToken(user.id);

    return respond(res, 201, true, "Account created successfully.", {
      user,
      token,
    });
  } catch (err) {
    console.error("[register]", err);
    return respond(res, 500, false, "Server error during registration.");
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return respond(
        res,
        422,
        false,
        errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      );

    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return respond(res, 401, false, "Invalid email or password.");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return respond(res, 401, false, "Invalid email or password.");

    const { password: _pw, ...safeUser } = user;
    const token = signToken(safeUser.id);

    return respond(res, 200, true, "Login successful.", {
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("[login]", err);
    return respond(res, 500, false, "Server error during login.");
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return respond(res, 404, false, "User not found.");
    return respond(res, 200, true, "User retrieved.", user);
  } catch (err) {
    console.error("[getMe]", err);
    return respond(res, 500, false, "Server error.");
  }
};

module.exports = { register, login, getMe };
