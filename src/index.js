const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const Filter = require("bad-words");
const io = socket(server);
const { generateMessage } = require("./utils/messages");
let userDB = require("./utils/users");
const port = process.env.port || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));
io.on("connection", (socket) => {
  console.log("New Connection detected");

  socket.on("join", (options, callback) => {
    //    console.log( options);
    const { user, error } = userDB.addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    // console.log(user);
    socket.join(user.room);

    socket.emit("message", generateMessage("System", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("System", `${user.username} joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: userDB.getUsersInRoom(user.room),
    });
    callback();
  });
  socket.on("sendMessage", (msg, callback) => {
    // let filter = new Filter();

    // // if (filter.isProfane(msg)) {
    // //   return callback(generateMessage("Bad Words not allowed"));
    // // }
    const user = userDB.getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, msg));

    callback();
  });
  socket.on("sendLocation", (location, callback) => {
    const user = userDB.getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = userDB.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("System", `${user.username} left the chat`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: userDB.getUsersInRoom(user.room),
      });
    }
  });
});
server.listen(port, () => {
  console.log(`Server is up and running in ${port} `);
});
