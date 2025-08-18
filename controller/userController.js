const userModul = require("../model/userModul.js");

exports.getAllUser = async (req, res) => {
  try {
    const result = await userModul.getAll();
    console.log(result);

    if (!Array.isArray(result) || result.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({
      status: "success",
      data: { users: result },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  console.log(userId, typeof userId);
  try {
    const result = await userModul.getUserById(userId);
    console.log(result);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: { user: result },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
