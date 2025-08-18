const db = require("../testCon.js");

const userModul = {
  getAll: async () => {
    try {
      const result = await db.query(
        "SELECT userName, rolename FROM users u JOIN roles r ON u.role_id = r.roleId"
      );
      const users = result.rows; // ✅ Correct usage
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Return empty array to match expected type
    }
  },
  getUserById: async (userId) => {
    try {
      const result = await db.query(
        "SELECT userName, rolename FROM users u JOIN roles r ON u.role_id = r.roleId WHERE u.userId = $1",
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  },
};

module.exports = userModul;
// Import the database connection
