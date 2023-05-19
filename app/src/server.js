const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const rootRouter = require("./router");
const qs = require("qs");
const { sequelize } = require("./models");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { MessageModel } = require("./models");
const axios = require("axios");
require("dotenv").config();
const createMessage = require("./utils/CreateMessage");

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

//xử lý socket io
//Khi client connect
io.on("connection", (socket) => {
  let dataOn = {
    status: true,
  };

  let dataOff = {
    status: false,
  };
  // join room
  socket.on("client join room", async ({ userNameF, room }) => {
    dataOn.userName = userNameF;
    dataOff.userName = userNameF;

    try {
      const status = await axios.post(
        "http://localhost:3002/user/updateStatus",
        dataOn
      );
    } catch (error) {
      console.log("co loix");
      console.log(error);
    }

    socket.join(room);
    //xử lý tin nhắn (chat)
    socket.on("send-message-to-server", async (data, callback) => {
      let message = data.message;
      try {
        message = filter.clean(message);
        message = createMessage(message);
      } catch (error) {
        console.log(error);
      }

      io.to(room).emit("server-send-message-to-client", {
        userNameF: data.userNameF,
        userNameT: data.userNameT,
        message,
      });
    });

    //xử lý share location
    socket.on("share-location", (data) => {
      const { latitude, longitude } = data;
      const linkLocation = createMessage(
        `https://www.google.com/maps?q=${latitude},${longitude}`
      );
      io.to(room).emit("server-send-location-to-client", {
        userNameF: data.userNameF,
        userNameT: data.userNameT,
        message: linkLocation,
      });
    });
  });

  // disconnect
  socket.on("disconnect", async () => {
    try {
      const status = await axios.post(
        "http://localhost:3002/user/updateStatus",
        dataOff
      );
    } catch (error) {
      console.log("Loix off");
    }
  });
});

server.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    console.log(`App running on http://localhost:${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
