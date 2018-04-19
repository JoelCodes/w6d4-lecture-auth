import React from 'react';
import Axios from 'axios';

class Game extends React.Component {
  constructor() {
    super();
    this.state = { connected: false };
  }
  async componentDidMount() {
    const result = await Axios.post('/token');
    console.log('Token', result.data);
    this.socket = new WebSocket(`ws://localhost:3002?token=${result.data}asdf`);
    this.socket.onopen = () => {
      this.setState({ connected: true });
    };
    this.socket.onclose = () => {
      this.setState({ connected: false });
    };
  }
  render() {
    if (!this.state.connected) {
      return <h2>Connecting...</h2>;
    }
    return <h2>Connected</h2>;
  }
}

export default Game;
