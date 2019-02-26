import Cell from './cell'

function Array2D(width, height) {
  let arr = new Array(height);

  for (let i = 0; i < height; i++) {
    arr[i] = new Array(width);
  }

  return arr;
}

class Grid  {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.currentBufferIndex = 0;
    this.buffer = [
      Array2D(width, height),
      Array2D(width, height)
    ];
    this.clear();
    this.generation = 0;
  }

  getCells() {
    return this.buffer[this.currentBufferIndex];
  }

  getGen() {
    return this.generation;
  }

  clear() {
    this.generation = 0;
    let buffer = this.buffer[this.currentBufferIndex];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        buffer[y][x] = new Cell();
        buffer[y][x].setState(0); 
      }
    }
  }

  buildGrid() {
    let buffer = this.buffer[this.currentBufferIndex];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        buffer[y][x] = new Cell(); // Random 0 or 1
      }
    }
  }

  nextGen() {
    let backBufferIndex = this.currentBufferIndex === 0 ? 1: 0;
    let currentBuffer = this.buffer[this.currentBufferIndex];
    let backBuffer = this.buffer[backBufferIndex];

    /**
     * Count the neighbors of a cell
     */
    function countNeighbors(x, y, options={border:'zero'}) {
      let neighborCount = 0;

      if (options.border === 'wrap') {
        let north = y - 1;
        let south = y + 1;
        let west = x - 1;
        let east = x + 1;

        // Wrap around the edges

        if (north < 0) {
          north = this.height - 1;
        }

       if (south === this.height) {
          south = 0;
        }

        if (west < 0) {
          west = this.width - 1;
        }

        if (east === this.width) {
          east = 0;
        }

        neighborCount =
          currentBuffer[north][west].currentState +
          currentBuffer[north][x].currentState +
          currentBuffer[north][east].currentState +
          currentBuffer[y][west].currentState +
          currentBuffer[y][east].currentState +
          currentBuffer[south][west].currentState +
          currentBuffer[south][x].currentState +
          currentBuffer[south][east].currentState;

      } else if (options.border === 'zero') {
        // Treat out of bounds as zero
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
          let yPos = y + yOffset;

          if (yPos < 0 || yPos === this.height) {
            // Out of bounds
            continue;
          }

          for (let xOffset = -1; xOffset <= 1; xOffset++) {
            let xPos = x + xOffset;

            if (xPos < 0 || xPos === this.width) {
              // Out of bounds
              continue;
            }

            // Don't count center element
            if (xOffset === 0 && yOffset === 0) {
              continue;
            }

            neighborCount += currentBuffer[yPos][xPos].currentState;
          }
        }

      } else {
        throw new Error('unknown border option' + options.border);
      }

      return neighborCount;
    } // countNeighbors()

    // Loop through and decide if the next generation is alive or dead
    // for each cell processed.
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let neighborCount = (countNeighbors.bind(this))(x, y);
        let thisCell = currentBuffer[y][x].currentState;

        if (typeof backBuffer[y][x] === 'undefined') {
          backBuffer[y][x] = new Cell();
        }

        if (thisCell === 1) {
          // We're alive. Let's check if we're dying.
          if (neighborCount < 2 || neighborCount > 3) {
            // Wake up. Time to die.
            backBuffer[y][x].setState(0)
          } else {
          // We're still alive!
            backBuffer[y][x].setState(1)
          }
        } else {
          // We're dead. Let's see if we come to life.
          if (neighborCount === 3) {
          // A rebirth!
            backBuffer[y][x].setState(1)
          } else {
            // We're still dead
            backBuffer[y][x].setState(0)
          } 
        }
      }
    }

    // Now the backBuffer is populated with the next generation life
    // data. So we declare that to be the new current buffer.
    this.currentBufferIndex = this.currentBufferIndex === 0 ? 1: 0;
    this.generation++;
  }
}

export default Grid;