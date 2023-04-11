const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const rootRouter = require("./router");
const { sequelize } = require("./models");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
require("dotenv").config();
const createMessage = require("./utils/CreateMessage");
const {
  getUserList,
  addUser,
  removeUser,
  findUser,
} = require("./utils/UserListInRoom");

const port = process.env.PORT;

const filter = new Filter();
const publicPath = path.join(__dirname, "../public");
const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const server = http.createServer(app);
const io = socketio(server);

//xử lý socket io
//Khi client connect
io.on("connection", (socket) => {
  socket.emit("default-message", {
    name: "ADMIN",
    message: createMessage(
      "Chào mừng bạn đến với ứng dụng chat của chúng tôi!"
    ),
  });

  // socket.broadcast.emit(
  //   "default-message",
  //   createMessage("Có một thành viên mới tham gia")
  // );

  // join room
  socket.on("client join room", ({ name, room }) => {
    socket.join(room);
    const newUser = { id: socket.id, name, room };
    addUser(newUser);

    //Gửi lời chào tới room
    socket.broadcast.to(room).emit("welcome to room", {
      name: "ADMIN",
      message: createMessage(`${name} vừa tham gia vào phòng`),
    });

    //Gửi danh sách user trong room về cho client
    const listUserInRoom = getUserList(room);
    io.emit("server send user list", listUserInRoom);

    //xử lý tin nhắn (chat)
    socket.on("send-message-to-server", (data, callback) => {
      let message = data.message;
      // try {
      //   message = filter.clean(message);
      //   message = createMessage(message);
      // } catch (error) {
      //   console.log(error);
      // }
      message = createMessage(message);

      io.to(room).emit("server-send-message-to-client", { name, message });
      callback();
    });

    //xử lý share location
    socket.on("share-location", (data) => {
      const { latitude, longitude } = data;
      const linkLocation = createMessage(
        `https://www.google.com/maps?q=${latitude},${longitude}`
      );
      io.to(room).emit("server-send-location-to-client", {
        name,
        message: linkLocation,
      });
    });
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("One user left server");
    removeUser(socket.id);
  });
});

app.use(express.static(publicPath));

app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
  })
);

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "resources", "views"));
app.use(cookieParser());
app.use(
  cookieSession({
    keys: "thanh",
  })
);
app.use(rootRouter);

server.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    console.log(`App running on http://localhost:${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
