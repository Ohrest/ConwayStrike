var rows = 80;
var cols = 160;

var iterations = 0;
var functions = require("./functions.js");

var myBoard = functions.makeEmptyBoard();
var myCells = functions.makeCells(myBoard);
var chatMessages = [];
const server = require("http").createServer();
const io = require("socket.io")(server);
var nu = 0;

io.on("connection", function(socket) {
  console.log("client connected");
  socket.emit("message", "Connected");
  io.sockets.emit("usersOnlineUpdate", io.engine.clientsCount);

  socket.on("cellUpdate", function(data) {
    console.log("Type of Pattern:", data.typeOfPattern);
    if (data.x > 2 && data.x < rows - 3 && data.y > 2 && data.y < cols - 3) {
      console.log("(", data.y, ",", data.x, ")");

      insertUpdate(data);

      myCells = functions.makeCells(myBoard);
      io.sockets.emit("cells", myCells);
    } else {
      console.log("\x1b[41m%s\x1b[0m", "refused(", data.y, data.x, ")");
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected"));

  socket.on("newMessage", function(data) {
    console.log("newMessage: ", data.messageEmitted);
    chatMessages.push('(' + new Date().toISOString().substr(0, 19).replace('T', ' ') +'): ' + data.messageEmitted);
    if (chatMessages.length > 20) chatMessages.shift();
    io.sockets.emit("updatedMessages", chatMessages);
  });

  socket.on("disconnect", () =>
    io.sockets.emit("usersOnlineUpdate", io.engine.clientsCount)
  );
});

function iterationsLoop() {
  myBoard = functions.iterate(myBoard);
  myCells = functions.makeCells(myBoard);
  io.sockets.emit("cells", myCells);
  io.sockets.emit("iterationsUpdate", iterations);
  iterations++;
  //io.sockets.emit('message', nu);
  console.log("Iteration: ", iterations, "Clients: ", io.engine.clientsCount);
}
setInterval(iterationsLoop, 500); //time is in ms

function insertUpdate(data) {
  switch (data.typeOfPattern) {
    case "1":
      myBoard[data.x][data.y] = true;
      myBoard[data.x][data.y - 1] = true;
      myBoard[data.x][data.y + 1] = true;
      break;
    case "2":
      myBoard[data.x][data.y] = false;
      myBoard[data.x - 1][data.y] = true;
      myBoard[data.x][data.y + 1] = true;
      myBoard[data.x + 1][data.y + 1] = true;
      myBoard[data.x + 1][data.y] = true;
      myBoard[data.x + 1][data.y - 1] = true;
      break;
    case "3":
      myBoard[data.x - 1][data.y + 1] = true;
      myBoard[data.x + 1][data.y + 2] = true;
      myBoard[data.x - 1][data.y - 2] = true;
      myBoard[data.x + 2][data.y - 1] = true;
      myBoard[data.x + 2][data.y] = true;
      myBoard[data.x + 2][data.y + 1] = true;
      myBoard[data.x + 2][data.y + 2] = true;
      myBoard[data.x][data.y + 2] = true;
      myBoard[data.x + 1][data.y - 2] = true;
      break;
    default:
    // code block
  }
}

server.listen(7856, function(err) {
  if (err) throw err;
  console.log("listening");
});
