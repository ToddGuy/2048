//helper functions

import {directions} from "./data";

export const rng = (min, max, random) => Math.floor((random === undefined ? Math.random() : random )* (max - min)) + min;

export const range = (start, end) => [...Array(end - start).keys()].map((_, i) => i + start);

export const generateKey = (function() {
  let i = 0;
  return () => i++;
})();

export const canMove = (tiles, direction) => {

  let rowTraverseCondition;
  let colTraverseCondition;
  let shift;
  let swapRowCol = false;
  let startRow;
  let startCol;
  let getTile;

  const {up, left, down, right} = directions;

  switch (direction) {
    case up:
      swapRowCol = true;
    case left:
      rowTraverseCondition = (row) => row > -1;
      colTraverseCondition = (col) => col > 0;
      shift = (num) => --num;
      startRow = 3;
      startCol = 3;
      getTile = (row, col) => swapRowCol ?
        { tile: tiles[col][row], nextTile: tiles[col - 1][row] } :
        { tile: tiles[row][col], nextTile: tiles[row][col - 1] };
      break;

    case down:
      swapRowCol = true;
    case right: //right
      rowTraverseCondition = (row) => row < 4;
      colTraverseCondition = (col) => col < 3;
      shift = (num) => ++num;
      startRow = 0;
      startCol = 0;
      getTile = (row, col) => swapRowCol ?
        { tile: tiles[col][row], nextTile: tiles[col + 1][row] } :
        { tile: tiles[row][col], nextTile: tiles[row][col + 1] };
      break;

    default:
      return false;
  }

  for (let row = startRow; rowTraverseCondition(row); row = shift(row)) {
    for (let col = startCol; colTraverseCondition(col); col = shift(col)) {
      const { tile, nextTile } = getTile(row, col);
      if (tile.filled && (!nextTile.filled || tile.value === nextTile.value)) {
        return true;
      }
    }
  }

  return false;
};

