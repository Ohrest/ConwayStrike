rows = 80;
cols = 160;

module.exports = {
  createArray: function (length) {
    var arr = new Array(length || 0),
      i = length;

    if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      while (i--) arr[length - 1 - i] = this.createArray.apply(this, args);
    }
    return arr;
  },

  makeEmptyBoard: function () {
    let board = [];
    for (let y = 0; y < rows; y++) {
      board[y] = [];
      for (let x = 0; x < cols; x++) {
        board[y][x] = { value: false, color: 0 };
        //board[y][x].value = false;
        //board[y][x].color = 0;
      }
    }
    return board;
  },

  calculateNeighbors2: function (board, x, y) {
    let neighbors = 0;
    let redNeighbors = 0;
    let blueNeighbors = 0;

    //If cells reach borders, they reappear on the other side of the border
    let xPlusOne = x + 1;
    let xMinusOne = x - 1;
    let yPlusOne = y + 1;
    let yMinusOne = y - 1;
    if (x == cols - 1) xPlusOne = 0;
    if (x == 0) xMinusOne = cols - 1;
    if (y == rows - 1) yPlusOne = 0;
    if (y == 0) yMinusOne = rows - 1;

    if (board[y][xMinusOne].value) {
      neighbors++;
      board[y][xMinusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yPlusOne][xMinusOne].value) {
      neighbors++;
      board[yPlusOne][xMinusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yPlusOne][x].value) {
      neighbors++;
      board[yPlusOne][x].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yPlusOne][xPlusOne].value) {
      neighbors++;
      board[yPlusOne][xPlusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[y][xPlusOne].value) {
      neighbors++;
      board[y][xPlusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yMinusOne][xPlusOne].value) {
      neighbors++;
      board[yMinusOne][xPlusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yMinusOne][x].value) {
      neighbors++;
      board[yMinusOne][x].color == 1 ? blueNeighbors++ : redNeighbors++;
    }
    if (board[yMinusOne][xMinusOne].value) {
      neighbors++;
      board[yMinusOne][xMinusOne].color == 1 ? blueNeighbors++ : redNeighbors++;
    }

    if (redNeighbors < blueNeighbors) return { neighbors: neighbors, majorityNeighborsColor: 1 };
    if (redNeighbors > blueNeighbors) return { neighbors: neighbors, majorityNeighborsColor: 2 };
    else return { neighbors: neighbors, majorityNeighborsColor: (Math.floor(Math.random() * 2) + 1) };
  },

  iterate: function (board) {
    let newBoard = this.makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = this.calculateNeighbors2(board, x, y);



        if (board[y][x].value) {
          if (neighbors.neighbors === 2 || neighbors.neighbors === 3) {
            newBoard[y][x] = { value: true, color: neighbors.majorityNeighborsColor }
          } else {
            newBoard[y][x].value = false;
          }
        } else {
          if (!board[y][x].value && neighbors.neighbors === 3) { newBoard[y][x] = { value: true, color: neighbors.majorityNeighborsColor } }
        }

        {
          //return 
        }
      }
    }
    return newBoard;
  },

  makeCells: function (board) {
    let cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x].value) {
          let color = board[y][x].color;
          cells.push({ x, y, color });
        }
      }
    }
    return cells;
  },

  checkWinner: function (board) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        //if (board[y][x].value == true && y>=20 && y <=23 && x >=40 && x<=44) return 2;
        //if (board[y][x].value == true && y>=60 && y <=63 && x >=120 && x<=124) return 1;

        if (board[y][x].value == true && y >= 20 && y <= 22 && x >= 40 && x <= 44) return 2;
        if (board[y][x].value == true && y >= 57 && y <= 59 && x >= 120 && x <= 124) return 1;

      }

    }

    return 0;


  },

};
