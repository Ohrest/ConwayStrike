import React, { Component } from "react";
import { Form, Button, ListGroup, Table } from "react-bootstrap";
import StayScrolled from "react-stay-scrolled";

class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      messages: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.passSocket.on("updatedMessages", data => this.setState({ messages: data }) );
    this.props.passSocket.emit("newMessage", {
      messageEmitted: "New user connected"
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.message.length > 0 && this.state.message.length < 100)
      this.props.passSocket.emit("newMessage", {
        messageEmitted: this.state.message
      });
    this.setState({ message: "" });
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  render() {
    return (
      <div className="Form1">
        <br />
        <div className="messageList">
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Chat Box</th>
              </tr>
            </thead>
            <tbody>
              {this.state.messages.map(txt => (
                <tr>{txt}</tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="formBasicMessage">
            <Form.Label>Type message</Form.Label>
            <Form.Control
              type="text"
              value={this.state.message}
              onChange={this.handleChange}
              placeholder="Enter message.."
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Send
          </Button>
        </Form>

        
      </div>
    );
  }
}

export default ChatBox;
