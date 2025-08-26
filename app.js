const express = require("express");
const userRouter = require("./router/userRouter");
const bookRouter = require("./router/bookRouter");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", userRouter);

app.use("/books", bookRouter);

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server started at port ${process.env.PORT || 8000}`);
});
