const express = require("express");
const UserController = require("../controller/UserController");
const { authenticate } = require("../middlewares/authenticate/authen");

const userRouter = express.Router();

userRouter.get("/register", UserController.registerGet);
userRouter.post("/registerPost", UserController.registerPost);
userRouter.get("/login", UserController.loginGet);
userRouter.post("/loginPost", UserController.loginPost);
userRouter.get("/logout", UserController.logout);
userRouter.post("/addFriend", UserController.addFriend);
userRouter.post("/inbox/:userName", authenticate, UserController.inbox);
userRouter.post("/createMessage", authenticate, UserController.createMessage);
userRouter.post("/updateStatus", UserController.updateStatus);

// userRouter.post("/chat", authenticate, UserController.joinChat);
// userRouter.get("/chat", authenticate, UserController.joinChat);

module.exports = userRouter;
