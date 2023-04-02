const express = require("express");
const { authenticate } = require("../middlewares/authenticate/authen");
const UserController = require("../controller/UserController");

const userRouter = require("./user.router");

const rootRouter = express.Router();

rootRouter.use("/user", userRouter);

rootRouter.get("/", authenticate, (req, res) => {
  res.render("home");
});

module.exports = rootRouter;
