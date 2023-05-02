const express = require("express");
const UserController = require("../controller/UserController");
const { authenticate } = require("../middlewares/authenticate/authen");
const RoomController = require("../controller/RoomController");

const roomRouter = express.Router();

roomRouter.get("/createGet", RoomController.createRoomGet);
roomRouter.post("/createGet", RoomController.createRoomPost);

module.exports = roomRouter;
