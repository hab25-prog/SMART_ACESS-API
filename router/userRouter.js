const userController = require("../controller/userController");
const autController = require("../controller/autController");

const express = require("express");
const router = express.Router();
router.get(
  "/all",
  autController.jwtauth,
  autController.restricted,
  userController.getAllUser
);
router.get("/:id", userController.getUserById);
router.post("/signup", autController.signUp);
router.post("/login", autController.login);
router.post("/signup", autController.signUp);
router.post("/logout", autController.logout);

router.delete("/:id", userController.deleteUser);
module.exports = router;
