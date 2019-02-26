class Cell {
  constructor() {
    this.currentState = Math.floor(Math.random() * 2);
    this.total = 0;
  }
  
  setState(state) {
    this.currentState = state;
    this.total += state;
  }
}

export default Cell;