const express = require("express");
const { authenticate } = require("../middlewares/authenticate/authen");
const UserController = require("../controller/UserController");

const userRouter = require("./user.router");
const roomRouter = require("./room.router");
const RoomController = require("../controller/RoomController");

const rootRouter = express.Router();

rootRouter.use("/user", userRouter);
rootRouter.use("/room", roomRouter);

rootRouter.get("/", authenticate, RoomController.home);

module.exports = rootRouter;
