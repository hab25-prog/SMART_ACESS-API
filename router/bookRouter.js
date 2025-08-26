const express = require("express");
const upload = require("../medle_ware/upload");
const bookController = require("../controller/bookController");
const autController = require("../controller/autController");
const borrowController = require("../controller/borrowController");
const router = express.Router();
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.post(
  "/add",
  autController.jwtauth,
  upload.single("book"),
  bookController.uploadBook
);
router.post("/borrow", autController.jwtauth, borrowController.borrowBook);

module.exports = router;
