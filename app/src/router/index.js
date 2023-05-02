const express = require("express");
const { authenticate } = require("../middlewares/authenticate/authen");
const UserController = require("../controller/UserController");

const userRouter = require("./user.router");
const roomRouter = require("./room.router");

const rootRouter = express.Router();

rootRouter.use("/user", userRouter);
rootRouter.use("/room", roomRouter);

rootRouter.get("/", authenticate, UserController.home);

module.exports = rootRouter;
