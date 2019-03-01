rows = 80;
cols = 160;

module.exports = {
  createArray: function(length) {
    var arr = new Array(length || 0),
      i = length;

    if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      while (i--) arr[length - 1 - i] = this.createArray.apply(this, args);
    }
    return arr;
  },

  makeEmptyBoard: function() {
    let board = [];
    for (let y = 0; y < rows; y++) {
      board[y] = [];
      for (let x = 0; x < cols; x++) {
        board[y][x] = false;
      }
    }
    return board;
  },

  calculateNeighbors2: function(board, x, y) {
    let neighbors = 0;
    if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
      if (board[y][x - 1] == true) neighbors++;
      if (board[y + 1][x - 1] == true) neighbors++;
      if (board[y + 1][x] == true) neighbors++;
      if (board[y + 1][x + 1] == true) neighbors++;
      if (board[y][x + 1] == true) neighbors++;
      if (board[y - 1][x + 1] == true) neighbors++;
      if (board[y - 1][x] == true) neighbors++;
      if (board[y - 1][x - 1] == true) neighbors++;
    }
    return neighbors;
  },

  iterate: function(board) {
    let newBoard = this.makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = this.calculateNeighbors2(board, x, y);

        if (board[y][x]) {
          if (neighbors === 2 || neighbors === 3) {
            newBoard[y][x] = true;
          } else {
            newBoard[y][x] = false;
          }
        } else {
          if (!board[y][x] && neighbors === 3) newBoard[y][x] = true;
        }
      }
    }
    return newBoard;
  },

  makeCells: function(board) {
    let cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (board[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }
};
