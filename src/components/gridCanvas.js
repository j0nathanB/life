import React, {Component} from 'react';
import Grid from './grid'
import hslToRgb from '../utils/hslToRgb'

class GridCanvas extends Component {
  constructor(props) {
    super(props);

    this.grid = new Grid(props.width, props.height);
    this.grid.buildGrid();
    this.state = {
      x: 0,
      y: 0,
      generation: this.grid.getGen(),
    }
    this.heatmap = false;
    this.stopRequested = true;
    this.update = this.update.bind(this);
    this.start = this.start.bind(this);
    this.startOver = this.startOver.bind(this);
    this.clear = this.clear.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
    this.startButtonHandler = this.startButtonHandler.bind(this);
    this.stopButtonHandler = this.stopButtonHandler.bind(this);
    this.clearButtonHandler = this.clearButtonHandler.bind(this);
    this.resetButtonHandler = this.resetButtonHandler.bind(this);
    this.heatmapButtonHandler = this.heatmapButtonHandler.bind(this);
  }
  
  componentDidMount() {
    this.drawGrid();
    if (!this.stopRequested) {
      requestAnimationFrame(this.update)
    }
  }

  startOver() {
    this.stopRequested = false;
    this.grid = new Grid(this.props.width, this.props.height);
    this.grid.buildGrid();

    requestAnimationFrame(this.update);
  }

  clear() {
    this.grid.clear();
    this.drawGrid();
    this.setState({ generation: this.grid.getGen() });
    this.stopRequested = true;
  }

  drawGrid() {
    let maxTotal = 0;
    let width = this.props.width;
    let height = this.props.height;

    // Update life and get cells
    let cells = this.grid.getCells();

    // Get canvas framebuffer, a packed RGBA array
    let canvas = this.refs.canvas;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y][x];
        if (cell.total > maxTotal) {
          maxTotal = cell.total;
        }
      }
    }
   
    // Convert the cell values into white or black for the canvas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 4 array entries per pixel, Red, Green, Blue, and Alpha:
        let index = (y * width + x) * 4;

        let lifeStatus = cells[y][x].currentState;
        const color = lifeStatus === 1 ? 0x00: 0xff;
        
        // assign hue value to cell total/board total relationship
        const normalized = (cells[y][x].total / maxTotal);
        const hue = Math.abs(1.0 - normalized) * 240;
        
        const colors = this.heatmap 
          ? hslToRgb(hue/360, 1, 0.5) // convert to rgb value
          : [color, color, color]
        
        imageData.data[index + 0] = colors[0]; // Red channel
        imageData.data[index + 1] = colors[1]; // Green channel
        imageData.data[index + 2] = colors[2]; // Blue channel
        imageData.data[index + 3] = 0xff;  // Alpha channel, 0xff = opaque
      }
    }

    // Put the new image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  update() {
    this.drawGrid();
    this.grid.nextGen();
    this.setState({ generation: this.grid.getGen() })

    if (!this.stopRequested) {
      requestAnimationFrame(this.update);
    }
  }

  start() {
    // when running, prevent 'start' from requesting new frame performance
    if (this.stopRequested) {
      this.stopRequested = false;
      requestAnimationFrame(this.update);
    }
  }

  startButtonHandler(e) {
    e.preventDefault();
    this.start();
  }

  stopButtonHandler(e) {
    e.preventDefault();
    this.stopRequested = true;
  }

  clearButtonHandler(e) {
    e.preventDefault();
    this.clear()
  }

  resetButtonHandler(e) {
    e.preventDefault();
    this.startOver(); 
  }

  heatmapButtonHandler(e) {
    e.preventDefault();
    this.heatmap = !this.heatmap;
    // toggle heatmap when paused
    if (this.stopRequested) {
      this.drawGrid();
    }
  }

  render() {
    return (
      <div id="gridCanvas" ref="elem">
        <canvas ref="canvas" width={this.props.width} height={this.props.height}/> 
        <div>
          <h3>Generation: { this.state.generation }</h3>
        </div>
        <div id="buttonContainer">
          <button onClick={this.startButtonHandler}><span>Start</span></button>
          <button onClick={this.stopButtonHandler}><span>Stop</span></button>
          <button onClick={this.clearButtonHandler}><span>Clear</span></button>
          <button onClick={this.resetButtonHandler }><span>Reset</span></button>
          <button onClick={this.heatmapButtonHandler}><span>Toggle Heatmap</span></button>
        </div>

        
      </div>
    )
  }
}

export default GridCanvas;