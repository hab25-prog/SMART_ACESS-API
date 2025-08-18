// const express = require("express");
const express = require("express");
const pool = require("./testCon.js");

const userRouter = require("./router/userRouter");

const app = express();
app.use(express.json());
app.use("/user", userRouter);

app.route("/login").post(async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  try {
    const result = await pool.query(
      "SELECT userId, username, rolename FROM users u JOIN roles r ON u.role_id = r.roleId WHERE u.username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log("server start at port 8000");
});
