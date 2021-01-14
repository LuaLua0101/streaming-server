var app = require("express")()
var http = require("http").createServer(app)
var io = require("socket.io")(http)
var cors = require('cors')

app.use(cors())

app.get("/", (req, res) => {
  res.send("Streaming server on ready")
})

http.listen(process.env.PORT || 5000, () => {
  console.log("listening on *:5000")
})

// streaming
const onConnect = (socket) => {
  console.log("a user connected")

  //============
  socket.on('join', (roomId) => {
    const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
    const numberOfClients = roomClients.length

    // These events are emitted only to the sender socket.
    if (numberOfClients == 0) {
      console.log(`Creating room ${roomId} and emitting room_created socket event`)
      socket.join(roomId)
      socket.emit('room_created', roomId)
    } else if (numberOfClients == 1) {
      console.log(`Joining room ${roomId} and emitting room_joined socket event`)
      socket.join(roomId)
      socket.emit('room_joined', roomId)
    } else {
      console.log(`Can't join room ${roomId}, emitting full_room socket event`)
      socket.emit('full_room', roomId)
    }
  })

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on('start_call', (roomId) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`)
    socket.broadcast.to(roomId).emit('start_call')
  })
  socket.on('webrtc_offer', (event) => {
    console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
  })
  socket.on('webrtc_answer', (event) => {
    console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
  })
  socket.on('webrtc_ice_candidate', (event) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
  //============

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
    io.in(data.room).emit("receive message", Math.random())
  })

  socket.on("disconnect", () => {
    console.log("user disconnected")
  })
}
io.on("connect", onConnect)
io.emit("an event sent to all connected clients")
