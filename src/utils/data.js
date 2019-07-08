import {createKey, rng} from "./utility";

export const directions = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

export function chooseTwoOrFour(randomMultiplier) {
  const arr = Array(10).fill(2);
  arr[4] = 4;
  return arr[rng(0, arr.length, randomMultiplier)];
}

export function markForShift(tile, index, posTile) {
  return {
    ...tile,
    xAxisPos: posTile.xAxisPos,
    yAxisPos: posTile.yAxisPos,
    filled: true,
    isNew: false,
    isMerged: false,
    filledPtr: index
  };
}

export function markForRemoval(tile, shiftedTile) {
  return {
    ...tile,
    filledPtr: -1,
    xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos,
    remove: true, filled: false
  };
}

const empty = {
  filled: false,
  isNew: false,
  isMerged: false,
  value: -1,
  filledPtr: -1
};

export function createEmptyTile() {
  return {...empty};
}

export function createNewTile(baseTile, filledPtr, value) {
    return {
      ...baseTile,
      key: createKey(),
      filled: true, isNew: true, isMerged: false,
      filledPtr, value
    };
}

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

export const colorMap = {
  colorArr: (function() {
    const arr = Array(10);
    const dark = "#776e65";
    const light = "#ffffff";
    arr[1] = {background: "#ece4d9", color: dark};
    arr[2] = {background: "#ede0c8", color: dark};
    arr[3] = {background: "#f2b179", color: light};
    arr[4] = {background: "#f59563", color: light};
    arr[5] = {background: "#f67c5f", color: light};
    arr[6] = {background: "#f65e3b", color: light};
    arr[7] = {background: "#eddb75", color: light};
    arr[8] = {background: "#edcf72",  color: light};
    arr[9] = {background: "#edcf59", color: light};
    arr[10] = {background: "#b0ed8f", color: light};
    arr[11] = {background: "#75c352", color: light};
    arr[12] = {background: "#52a026", color: light};
    arr[13] = {background: "#79faff", color: light};
    arr[14] = {background: "#6de3f8", color: light};
    arr[15] = {background: "#64d4ee", color: light};
    arr[16] = {background: "#ee93ee", color: light};
    arr[17] = {background: "#df84e5", color: light};
    arr[18] = {background: "#c26be2", color: light};
    return arr;
  })(),
  getColor: function(powerOf2) {
    const color = this.colorArr[Math.log2(powerOf2)];
    return color === undefined ? {background: "#83E1EC", color: "white"} : color;
  }
};
