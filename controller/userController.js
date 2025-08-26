const db = require("../testCon.js");
const bcrypt = require("bcrypt");
// Add this line if not already present

const saltRounds = 10;

exports.getAllUser = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT users.userId, users.username, users.email, roles.roleName FROM users JOIN roles ON users.role_id = roles.roleId"
    );

    if (!Array.isArray(result.rows) || result.rows.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }
    const users = result.rows;
    res.status(200).json({
      status: "success",
      data: { users: users },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getUserById = async (req, res) => {
  const userId = req.params.id * 1;
  console.log(userId, typeof userId);
  try {
    const result = await db.query(
      "SELECT username,rolename FROM users JOIN roles ON users.role_id = roles.roleId where userId=$1",
      [userId]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: { user: user },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await db.query(
      "UPDATE users SET username = $1, email = $2, password = $3 WHERE userId = $4 RETURNING userId",
      [username, email, hash, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: { userId: result.rows[0].userid },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.updateUserRole = async (req, res) => {
  const userId = req.params.id;
  const { roleId } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET role_id = $1 WHERE userId = $2 RETURNING userId",
      [roleId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: { userId: result.rows[0].userid },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query(
      "DELETE FROM users WHERE userId = $1 RETURNING userId",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(204).json({
        status: "success",
        message: "User deleted successfully",
      });
    }
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
