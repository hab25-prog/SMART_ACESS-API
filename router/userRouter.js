const express = require("express");
const userController = require("../controller/userController");
const router = express.Router();
router.get("/all", userController.getAllUser);
router.get("/:id", userController.getUserById);
module.exports = router;
