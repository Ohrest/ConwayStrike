var rows = 80;
var cols = 160;

var iterations = 0;
var functions = require("./functions.js");

var myBoard = functions.makeEmptyBoard();
var myCells = functions.makeCells(myBoard);
var chatMessages = [];
const server = require("http").createServer();
const io = require("socket.io")(server);

var blueScore = 0, redScore = 0;
var mode = 0; //mode0 = cpu vs cpu, mode1 = 1 player vs cpu, mode2, players vs players
var clients = [];

io.on("connection", function (socket) {

  console.log("client connected, socket.id: ", socket.id, ', IP: ' , socket.conn.remoteAddress);
  let assignTeam;
  if (io.engine.clientsCount ==1) {
    assignTeam = 1; //If there's no-one else in the server, the user gets assigned team blue and gets to play against cpu (red team)
    chatMessages.push({ messageEmitted: "[Server]: It appears you're the only one in the server, you get to play against the server (server is Red)", teamAssigned: 0 });
    if (chatMessages.length > 10) { chatMessages.splice(0, (chatMessages.length - 10)) }
  }
  else {
    assignTeam = assignTeamWithFewerPlayers();
  }

  socket.emit("teamAssigned", assignTeam); //Assign team to Player, either team 1 or team 2
  
  clients.push({sockedID: socket.id, teamAssigned: assignTeam})

  chatMessages.push({ messageEmitted: "New User connected, users online: " + io.engine.clientsCount , teamAssigned: assignTeam });
  if (chatMessages.length > 10) chatMessages.shift();
  io.sockets.emit("updatedMessages", chatMessages);

  io.sockets.emit("usersOnlineUpdate", io.engine.clientsCount);
  io.sockets.emit("scoresUpdate", {blue: blueScore, red: redScore});

  socket.on("cellUpdate", function (data) {
    if (data.x > 2 && data.x < rows - 3 && data.y > 2 && data.y < cols - 3) {
      console.log("(", data.y, ",", data.x, "), team: ", data.teamAssigned, ', pattern: ', data.typeOfPattern, ', time: ' , new Date().toISOString(), 'online users: ', io.engine.clientsCount);

      insertUpdate(data);


      myCells = functions.makeCells(myBoard);
      //io.sockets.emit("cells", myCells);
      socket.emit("cells", myCells);
    } else {
      console.log("\x1b[41m%s\x1b[0m", "refused(", data.y, data.x, ")");
    }
  });

  socket.on("disconnect", () => {
    chatMessages.push({ messageEmitted: "A User has disconnected, users online: " + io.engine.clientsCount , teamAssigned: 0 });
    if (chatMessages.length > 10) chatMessages.shift();
    io.sockets.emit("updatedMessages", chatMessages);

    console.log("Client disconnected ", socket.id, ' users: ' , io.engine.clientsCount);
    clients = clients.filter(client => client.sockedID != socket.id); //Remove client from clients array when it is disconnected
});

  socket.on("newMessage", function (data) { //When new chat message is received (emitted from client), add it to the array of messages and emit updated array of messages to all clients
    console.log("newMessage: ", data.messageEmitted);
    chatMessages.push({ messageEmitted: data.messageEmitted, teamAssigned: data.teamAssigned });
    if (chatMessages.length > 10) chatMessages.shift();
    io.sockets.emit("updatedMessages", chatMessages);
  });

  socket.on("disconnect", () =>
    io.sockets.emit("usersOnlineUpdate", io.engine.clientsCount)
  );
});

function iterationsLoop() { //Game logic loop that gets executed every x ms: iterate board -> create array containing active cells -> send array to clients -> check if there's a winner

  if (io.engine.clientsCount == 1) { //If just 1 user is online, user plays against the server, server is team 2 (red)
    io.sockets.emit("teamAssigned", 1); //Assign team to Player, either team 1 or team 2
    //clients[0].teamAssigned=1;  //Bad practice, remove later or make sure clients[0] exists (This updates teamAssigned value of the only element of the clients array index) 
    for (let cli of clients){
      cli.teamAssigned = 1;
    }
    serverPlay();
  }

  for (let i = 0; i < 1; i++) {
    myBoard = functions.iterate(myBoard);
  }
  myCells = functions.makeCells(myBoard);
  io.sockets.emit("cells", myCells);
  io.sockets.emit("iterationsUpdate", iterations);
  iterations++;
  //console.log("Iteration: ", iterations, "Clients: ", io.engine.clientsCount);

  for (let i = 0; i < clients.length; i++){ //Keep track of clients, in order to assign teams in a balanced manner
    //console.log('client socket id: ', clients[i].sockedID, ', teamAssigned: ' , clients[i].teamAssigned, ', time: ' , new Date().toISOString() )
  }


  let winnerTeam = functions.checkWinner(myBoard); //Check if there's a winner (flag captured), checkWinner returns 0 if there's no winner.
  if (winnerTeam > 0) {
    if (winnerTeam == 1) blueScore++;
    if (winnerTeam == 2) redScore++;
    chatMessages.push({ messageEmitted: (winnerTeam == 1 ? "[Server]: RED " : "[SERVER]: BLUE ") + "FLAG IS DESTROYED!", teamAssigned: 0 });
    chatMessages.push({ messageEmitted: "[Server]: Board reset, GO!", teamAssigned: 0 });
    if (chatMessages.length > 10) { chatMessages.splice(0, (chatMessages.length - 10)) }
    io.sockets.emit("updatedMessages", chatMessages);
    io.sockets.emit("scoresUpdate", {blue: blueScore, red: redScore});
    setTimeout(function () {
      // Wait 5 seconds
    }, 5000);

    myBoard = functions.makeEmptyBoard(); // Empty board after a team has scored

  }



}
setInterval(iterationsLoop, 300); //time is in ms

//server.listen(3474, function (err) { //Testing port
server.listen(7856, function (err) { //Deploy port
  if (err) throw err;
  console.log("listening");
});


assignTeamWithFewerPlayers = () => {
  let blueTeamPlayers = 0;
  let redTeamPlayers = 0;
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].teamAssigned == 1) blueTeamPlayers++;
    if (clients[i].teamAssigned == 2) redTeamPlayers++;
  }

  if (blueTeamPlayers > redTeamPlayers) return 2;
  if (blueTeamPlayers < redTeamPlayers) return 1;

  return Math.floor(Math.random() * 2) + 1; //If same number of players for each team, assign random team
}


serverPlay = () => {
  function randomIntFromInterval(min, max){ // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  if (randomIntFromInterval(1, 10) == 3) {
    let y = randomIntFromInterval(80, 113);
    let x = randomIntFromInterval(39, 73);
    insertUpdate({ x: x, y: y, typeOfPattern: '2', teamAssigned: 2 });
  }

  if (randomIntFromInterval(1, 100) == 3) {
    let randomMessage = randomIntFromInterval(1, 4);
    switch(randomMessage){
      case 1: chatMessages.push({ messageEmitted: "[Server]: All your base are belong to us", teamAssigned: 2 }); break;
      case 2: chatMessages.push({ messageEmitted: "[Server]: You will be destroyed", teamAssigned: 2 }); break;
      case 3: chatMessages.push({ messageEmitted: "[Server]: Resistance is futile ", teamAssigned: 2 }); break;
      case 4: chatMessages.push({ messageEmitted: "Reminder: only 1 user online, therefore playing against the server ", teamAssigned: 0 }); break;

    }
    if (chatMessages.length > 10) { chatMessages.splice(0, (chatMessages.length - 10)) }
    io.sockets.emit("updatedMessages", chatMessages);

    

  }


}


function insertUpdate(data) { // Given X,Y, pattern type (received from client), insert the relevant pattern to the current board
  if (data.teamAssigned == 1) {
    switch (data.typeOfPattern) {
      case "1":
        myBoard[data.x][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y + 1] = { value: true, color: data.teamAssigned }
        break;
      case "2":
        myBoard[data.x][data.y] = { value: false, color: data.teamAssigned }
        myBoard[data.x - 1][data.y] = { value: true, color: data.teamAssigned };
        myBoard[data.x][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y - 1] = { value: true, color: data.teamAssigned }
        break;
      case "3":
        myBoard[data.x - 1][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y + 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 1][data.y - 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 2][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 2][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 2][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 2][data.y + 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y + 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y - 2] = { value: true, color: data.teamAssigned }
        break;
      default:
    }
  }
  if (data.teamAssigned == 2) {
    switch (data.typeOfPattern) {
      case "1":
        myBoard[data.x][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y + 1] = { value: true, color: data.teamAssigned }
        break;
      case "2":
        myBoard[data.x][data.y] = { value: false, color: data.teamAssigned }
        myBoard[data.x - 1][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 1][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 1][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y] = { value: true, color: data.teamAssigned }

        break;
      case "3":
        myBoard[data.x - 2][data.y - 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 1][data.y - 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x][data.y - 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 2][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y - 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 2][data.y] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 2][data.y + 1] = { value: true, color: data.teamAssigned }
        myBoard[data.x + 1][data.y + 2] = { value: true, color: data.teamAssigned }
        myBoard[data.x - 1][data.y + 2] = { value: true, color: data.teamAssigned }
        break;
    }
  }
}