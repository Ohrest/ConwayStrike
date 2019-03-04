import React, { Component } from "react";
import "./App.css";
import ChatBox from "./chatBox";
import { Form, Button } from "react-bootstrap";
import * as io from "socket.io-client";

import { Popover } from "react-bootstrap";
import BlueFlag from "./Images/BlueFlag.png";
import RedFlag from "./Images/RedFlag.png";

const CELL_SIZE = 10;
const WIDTH = 1600;
const HEIGHT = 800;

const socket = io.connect("http://34.73.5.129:3474"); //Testing
//const socket = io.connect("http://34.73.5.129:7856");   //Deploy

class Cell extends Component {
  render() {
    const { x, y, color } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELL_SIZE * x + 1}px`,
          top: `${CELL_SIZE * y + 1}px`,
          width: `${CELL_SIZE - 1}px`,
          height: `${CELL_SIZE - 1}px`,
          //background: color==1 ? 'rgb(0, 0, 255)' : 'rgb(255, 0, 0)',
          background:
            color == 0
              ? "rgb(255, 255, 255)"
              : color == 1
              ? "rgb(60,20,255)"
              : "rgb(255,20,60)"
        }}
      />
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.rows = HEIGHT / CELL_SIZE;
    this.cols = WIDTH / CELL_SIZE;

    this.state = {
      cells: [],
      usersOnline: 0,
      typeOfPattern: "2",
      iterations: 0,
      teamAssigned: 0,
      scores: { blue: 0, red: 0 },
      connectionStatus: socket.connected
    };
    this.handlePatternChange = this.handlePatternChange.bind(this);
  }

  componentDidMount() {
    socket.on("cells", data => this.setState({ cells: data }));
    socket.on("usersOnlineUpdate", data =>
      this.setState({ usersOnline: data })
    );
    socket.on("iterationsUpdate", data => this.setState({ iterations: data }));
    socket.on("teamAssigned", data => this.setState({ teamAssigned: data }));
    socket.on("scoresUpdate", data => this.setState({ scores: data }));
  }

  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;

    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop
    };
  }

  handleClick = event => {
    const elemOffset = this.getElementOffset();
    const offsetX = event.clientX + getScrollFromLeft() - elemOffset.x;
    const offsetY = event.clientY + getScrollFromTop() - elemOffset.y;

    //if (this.state.teamAssigned==1 && offsetX)

    // Only allow clicking on side of the screen where the user's flag is.
    //Construct line from given points
    let x1 = (1 / 4) * WIDTH;
    let x2 = (3 / 4) * WIDTH;
    let y1 = HEIGHT;
    let y2 = 0;

    function line(x) {
      return ((y2 - y1) / (x2 - x1)) * (x - x1) + y1;
    }

    // Check if (x3|y3) is on top or bottom side
    let x3 = offsetX;
    let y3 = offsetY;
    if (y3 - line(x3) < 0 && this.state.teamAssigned == 2) {
      console.log("Left");
      return;
    } else if (y3 - line(x3) > 0 && this.state.teamAssigned == 1) {
      return;
      console.log("Right");
    } else {
      console.log("On line");
    }

    const x = Math.floor(offsetX / CELL_SIZE);
    const y = Math.floor(offsetY / CELL_SIZE);
    console.log(x, y);

    //console.log('scrollTOp: ', getScrollFromTop(), 'scrollleft: ', getScrollFromLeft() );

    socket.emit("cellUpdate", {
      x: y,
      y: x,
      typeOfPattern: this.state.typeOfPattern,
      teamAssigned: this.state.teamAssigned
    });
  };

  handlePatternChange(event) {
    this.setState({ typeOfPattern: event.target.value });
  }

  render() {
    const { cells } = this.state;
    return (
      <div className="App">
        <div
          className="Board"
          style={{
            width: WIDTH,
            height: HEIGHT,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
          }}
          onClick={this.handleClick}
          ref={n => {
            this.boardRef = n;
          }}
        >
          <img
            src={BlueFlag}
            style={{
              width: "50px",
              height: "50px",
              marginTop: HEIGHT / 4,
              marginLeft: WIDTH / 4,
              //marginTop: '200px',
              //marginLeft: '200px',
              position: "absolute"
            }}
          />

          <img
            src={RedFlag}
            style={{
              width: "50px",
              height: "50px",
              marginTop: (HEIGHT / 4) * 3 - 30,
              marginLeft: (WIDTH / 4) * 3,
              //marginTop: '200px',
              //marginLeft: '200px',
              position: "absolute"
            }}
          />

          {cells.map(cell => (
            <Cell
              x={cell.x}
              y={cell.y}
              color={cell.color}
              key={`${cell.x},${cell.y}`}
            />
          ))}

          <svg height="800" width="1600">
            <line
              x1="400"
              y1="800"
              x2="1200"
              y2="0"
              style={{ stroke: "#dfdfdf", strokeWidth: "2" }}
            />
          </svg>
        </div>

        <div className="chat-sidebar">
          <div>
            Server Status:
            {socket.connected ? (
              <span class="badge badge-success">Connected</span>
            ) : (
              <span class="badge badge-secondary">
                {" "}
                Waiting for connection..{" "}
              </span>
            )}
            Users Online: {this.state.usersOnline} <br />
            Pattern:
            <select
              class="mdb-select md-form"
              onChange={this.handlePatternChange}
            >
              <option value="1">Blinker</option>
              <option value="2" selected>
                Glider
              </option>
              <option value="3">Lightweight spaceship (LWSS)</option>
            </select>
            <div
              style={{
                color: this.state.teamAssigned == 1 ? "Blue" : "Red",
                fontSize: "20px"
              }}
            >
              You have been assigned team{" "}
              {this.state.teamAssigned == 1
                ? "Blue, you need to capture red flag!"
                : "Red, you need to capture blue flag!"}
            </div>
            How to play: You can click only on the side of the board where your
            flag is, once a cell touches the opponent's flag, your team scores.
            Be careful not to destroy your own flag! If there's only one user
            online, the user gets to play against the server.
            <br />
            <img
              src={BlueFlag}
              style={{
                width: "50px",
                height: "50px"
              }}
            />{" "}
            {this.state.scores.blue}
            <img
              src={RedFlag}
              style={{
                width: "50px",
                height: "50px"
              }}
            />{" "}
            {this.state.scores.red}
            <br />
            Iterations: {this.state.iterations}
            <ChatBox
              passSocket={socket}
              teamAssigned={this.state.teamAssigned}
            />
          </div>
        </div>

        <div class="line" />
      </div>
    );
  }
}

export default App;

function getScrollFromTop() {
  return (
    window.pageYOffset || //most browsers
    (document.documentElement && document.documentElement.scrollTop) || //
    document.body.scrollTop
  );
}

function getScrollFromLeft() {
  return (
    window.pageXOffset || //most browsers
    (document.documentElement && document.documentElement.scrollLeft) || //
    document.body.scrollLeft
  );
}
