var app = require("express")()
var http = require("http").createServer(app)
var io = require("socket.io")(http)

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>")
})

http.listen(8000, () => {
  console.log("listening on *:8000")
})

// streaming
const onConnect = (socket) => {
  console.log("a user connected")

  socket.emit("hello", "can you hear me?", 1, 2, "abc")

  socket.on("room", (data) => {
    console.log("room join")
    socket.join(data.room)
  })

  socket.on("leave room", (data) => {
    console.log("leaving room")
    console.log(data)
    socket.leave(data.room)
  })

  socket.on("new message", (data) => {
    console.log("get new mes = ", data)
    setTimeout(function () {
      io.in(data.room).emit("receive message", Math.random())
    }, 1000)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected")
  })
}
io.on("connect", onConnect)
io.emit("an event sent to all connected clients")
