const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../testCon.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { promisify } = require("util");
const crypto = require("crypto");

const tokengenerate = (id, res) => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRD_IN,
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    // secure: true, // Use secure cookies in production
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRD_IN * 24 * 60 * 60 * 1000
    ),
  });

  return token;
};

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;

  const hash = await bcrypt.hash(password, saltRounds);

  // Insert the new user into the database
  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING userId",
      [username, email, hash]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(400).json({ error: "Failed to create user" });
    }
    const user = result.rows[0];
    const token = tokengenerate(user.userId, res);

    res.status(201).json({
      status: "success",
      data: { userId: result.rows[0].userid },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "the email is exist" });
  }
};
exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  try {
    // Step 1: Find user by username
    const result = await db.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    console.log(user);

    // Step 2: Compare raw password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Step 3: Generate JWT
    const token = tokengenerate(user.userid, res);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.jwtauth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("JWT Token:", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    // Defensive check: make sure userId exists and is a number
    const userId = parseInt(decoded.userId);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload: missing or malformed userId",
      });
    }

    const result = await db.query("SELECT * FROM users WHERE userId = $1", [
      userId,
    ]);
    const user = result.rows[0];
    console.log("Authenticated user:", user);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    req.role = user.role_id;
    req.user = user; // Optional: attach full user object
    next();
  } catch (err) {
    console.error("JWT Auth Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid credentials or token expired",
    });
  }
};
exports.restricted = (req, res, next) => {
  console.log(req.role);
  if (req.role !== 1) {
    return res.status(403).json({
      status: "fail",
      message: "you are not authorized to access this resource",
    });
  }
  next();
};
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({ status: "success" });
};
