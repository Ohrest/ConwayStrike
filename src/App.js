import React, { Component } from "react";
import "./App.css";
import ChatBox from "./chatBox";
import { Form, Button } from "react-bootstrap";
import * as io from "socket.io-client";

import { Popover } from "react-bootstrap";

const CELL_SIZE = 10;
const WIDTH = 1600;
const HEIGHT = 800;

const socket = io.connect("http://34.76.167.112:7856");

class Cell extends Component {
  render() {
    const { x, y } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELL_SIZE * x + 1}px`,
          top: `${CELL_SIZE * y + 1}px`,
          width: `${CELL_SIZE - 1}px`,
          height: `${CELL_SIZE - 1}px`
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
      iterations: 0
    };
    this.handlePatternChange = this.handlePatternChange.bind(this);
  }

  componentDidMount() {
    socket.on("message", data => this.setState({ connectionStatus: data }));
    socket.on("cells", data => this.setState({ cells: data }));
    socket.on("usersOnlineUpdate", data =>
      this.setState({ usersOnline: data })
    );
    socket.on("iterationsUpdate", data => this.setState({ iterations: data }));
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

    const x = Math.floor(offsetX / CELL_SIZE);
    const y = Math.floor(offsetY / CELL_SIZE);
    console.log(x, y);

    console.log('scrollTOp: ', getScrollFromTop(), 'scrollleft: ', getScrollFromLeft() );

    socket.emit("cellUpdate", {
      x: y,
      y: x,
      typeOfPattern: this.state.typeOfPattern
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
          {cells.map(cell => (
            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
          ))}
        </div>

        <div className="chat-sidebar">
          <div>
            Server Status:
            {socket.connected != true ? (
              <span class="badge badge-secondary">
                Waiting for connection..
              </span>
            ) : (
              <span class="badge badge-success">Connected</span>
            )}{" "}
            Users Online: {this.state.usersOnline} <br />
            Pattern:
            <select
              class="mdb-select md-form"
              onChange={this.handlePatternChange}
            >
              <option value="1" selected>
                Blinker
              </option>
              <option value="2">Glider</option>
              <option value="3">Lightweight spaceship (LWSS)</option>
            </select>
            Iterations: {this.state.iterations}
            <ChatBox passSocket={socket} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;


function getScrollFromTop() {
  return window.pageYOffset ||  //most browsers
       (document.documentElement &&
          document.documentElement.scrollTop) || //
       document.body.scrollTop;
}

function getScrollFromLeft() {
  return window.pageXOffset ||  //most browsers
       (document.documentElement &&
          document.documentElement.scrollLeft) || //
       document.body.scrollLeft;
}