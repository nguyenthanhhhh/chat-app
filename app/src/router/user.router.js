const express = require("express");
const UserController = require("../controller/UserController");
const { authenticate } = require("../middlewares/authenticate/authen");

const userRouter = express.Router();

userRouter.get("/register", UserController.registerGet);
userRouter.post("/registerPost", UserController.registerPost);
userRouter.get("/login", UserController.loginGet);
userRouter.post("/loginPost", UserController.loginPost);
userRouter.get("/logout", UserController.logout);
userRouter.get("/chat", authenticate, UserController.joinChat);

module.exports = userRouter;
