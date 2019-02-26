import React, { Component } from 'react';

import './App.css';
import GridCanvas from './components/gridCanvas'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      COLS: 500,
      ROWS: 500,
    };
  }

  render() {
    return (
      <div className="App">
        <h1>Conway's Game of Life</h1>
        <GridCanvas width={this.state.COLS} height={this.state.ROWS}/>
        <h4>About this Game</h4>
     </div>
    );
  }
}

export default App;
