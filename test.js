const express = require("express");

const cors = require("cors");
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);
require("dotenv").config();

const bodyParser = require("body-parser");
const path = require("path");

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

const { v4: uuidV4 } = require("uuid");
// console.log(uuidV4);
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/end/:room", (req, res) => {
  res.render("over", {
    room: req.params.room,
  });
});

app.get("/:room", (req, res) => {
  res.render("room", {
    roomid: req.params.room,
  });
});
// app.post("/form", (req, res) => {
//   console.log(req.body);
// });
io.on("connection", (socket) => {
  socket.on("join-room", (room, user) => {
    socket.join(room);
    // console.log(room);
    socket.broadcast
      .to(room)
      .emit("user-connected", `user connected ${room}`, room, user);

    socket.on("disconnect", () => {
      socket.broadcast.to(room).emit("user-disconnected", user);
    });
    socket.on("message", (msg) => {
      socket.broadcast.to(room).emit("sending", msg);
    });
    // socket.on("next", () => {

    // });
    // socket.on("myvideo", (myVideo, stream) => {
    //   socket.broadcast.to(room).emit("seevid", myVideo, stream);
    // });
  });
});

server.listen(3000, () => {
  console.log("Server running");
});
