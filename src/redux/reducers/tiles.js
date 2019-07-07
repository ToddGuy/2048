import {SWIPE_TILES, START_MOVING, STOP_MOVING} from '../actionTypes';

import { Queue } from "../../utils/ds";
import {rng, createKey, range} from "../../utils/utility";
import {directions, canMove, markForRemoval, markForShift, createEmptyTile} from "../../utils/data";

const initialState = new (function(){
  const tiles = (function(){
    const ROWS = 4;
    const COLS = 4;

    const tiles = [];
    // +85px
    let yAxisPos = 5;
    for (let i = 0; i < ROWS; i++) {
      let xAxisPos = 5;
      let tileRow = [];
      tiles.push(tileRow);
      for (let j = 0; j < COLS; j++) {
        const tile = {
          row: i,
          col: j,
          yAxisPos: yAxisPos,
          xAxisPos: xAxisPos,
          filled: false,
          value: -1
        };
        xAxisPos += 85;
        tileRow.push(tile);
      }
      yAxisPos += 85;
    }

    let fn = function() {
      let row = rng(0, 4);
      let col = rng(0, 4);
      let value = rng(2, 5);
      value = (value === 3) ? 2 : value;

      if(tiles[row][col].filled === true) {
        const flip = rng(0, 1);
        let rowRange = 0;
        let colRange = 0;

        if (flip === 0) {
          rowRange = 1;
        } else {
          colRange = 1;
        }
        row = (row + rng(rowRange,3)) % 4;
        col = (col + rng(colRange, 3)) % 4;
      }

      tiles[row][col] = {
        ...tiles[row][col],
        filled: true,
        value,
        isNew: true,
        isMerged: false,
        key: createKey(),
        filledPtr: -1
      };
    };

    const arr = [...Array(4)].map(() => range(0, 4));
    let row = rng(0, arr.length);
    let col = rng(0, arr[row].length);

    tiles[row][col] = {
      ...tiles[row][col],
      filled: true,
      value: 2,
      isNew: true,
      isMerged: false,
      key: createKey(),
      filledPtr: -1
    };

    arr[row].splice(col, col);

    row = rng(0, arr.length);
    col = rng(0, arr[row].length);

    tiles[row][col] = {
      ...tiles[row][col],
      filled: true,
      value: 2,
      isNew: true,
      isMerged: false,
      key: createKey(),
      filledPtr: -1
    };


    return tiles;
  })();

  this.tiles = tiles;
  let i = 0; //position in list
  this.filledTiles = tiles.reduce((acc, row) => {
    return acc.concat(...row.reduce((accInner, col) => {
      if (col.filled) {
        col.filledPtr = i++;
        accInner.push(col);
      }
      return accInner;
    }, [])) }, []);

  this.moving = false;
})();


function swipeTiles(state, { payload: { direction, randomLocation, twoOrFour } }) {

  const tiles = state.tiles;
  let filledTiles = [...state.filledTiles];

  let rowTraverseCondition;
  let shift;
  let traverse;
  let swapRowCol = false;

  const {up, left, down, right} = directions;

  switch (direction) {
    case up:
      swapRowCol = true;
    case left:
      rowTraverseCondition = (x) => x < 4;
      shift = (x) => ++x;
      traverse = 0;
      break;

    case down:
      swapRowCol = true;
    case right:
      rowTraverseCondition = (x) => x > -1;
      shift = (x) => --x;
      traverse = 3;
      break;

    default:
      throw "Incorrect direction.";
  }

  const getTile = (row, col) => swapRowCol ? tiles[col][row] : tiles[row][col];
  const getRowCol = (row, col) => swapRowCol ? [col, row] : [row, col];

  const shiftedTiles = swapRowCol ? [[], [], [], []] : [];
  const emptyTiles = [];
  let numFilledTiles = filledTiles.length;

  let q = new Queue();
  for (let row = 0; row < 4; row++) {

    let shiftedRow = [];
    let cur = traverse; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    while (rowTraverseCondition(cur)) {
      const curTile = getTile(row, cur);
      if (curTile.filled) {

        q.push(curTile);

        const posTile = getTile(row, pos);

        if (q.getLength() === 2) {
          const front = q.pop();
          let shiftedTile = {...front, isNew: false, isMerged: false };
          if (front.value === q.peek().value) {
            const back = q.pop();
            shiftedTile = {
              ...shiftedTile,
              value: front.value * 2,
              filled: true,
              isMerged: true,
              isNew: false,
              key: createKey(),
              xAxisPos: posTile.xAxisPos,
              yAxisPos: posTile.yAxisPos,
              filledPtr: filledTiles.length
            };
            filledTiles.push(shiftedTile);

            // lose ptr to tiles since we're removing after transitioning
            filledTiles[back.filledPtr] = markForRemoval(filledTiles[back.filledPtr], shiftedTile);
            filledTiles[front.filledPtr] = markForRemoval(filledTiles[front.filledPtr], shiftedTile);

            numFilledTiles--; //subtract one for every 2 replaced with 1.
          } else {
            const index = shiftedTile.filledPtr;
            filledTiles[index] = markForShift(filledTiles[index], index, posTile);
            shiftedTile = filledTiles[index];
          }

          shiftedRow[pos] = shiftedTile;
          pos = shift(pos);
        }
      }
      cur = shift(cur);
    }

    if (!q.isEmpty()) { //last cell
      const index = q.pop().filledPtr;
      const posTile = getTile(row, pos);
      filledTiles[index] = markForShift(filledTiles[index], index, posTile);
      shiftedRow[pos] = filledTiles[index];
      pos = shift(pos);
    }

    while (rowTraverseCondition(pos)) {
      const emptyTile = createEmptyTile();
      const posTile = getTile(row, pos);
      const [swapRow, swapCol] = getRowCol(row, pos); //for finding and setting random tile to
      emptyTile.yAxisPos = posTile.yAxisPos;
      emptyTile.xAxisPos = posTile.xAxisPos;
      shiftedRow[pos] = emptyTile;

      emptyTiles.push({emptyTile, row: swapRow, col: swapCol});

      pos = shift(pos);
    }

    if (swapRowCol) {
      for (let i = 0; i < 4; i++) {
        shiftedTiles[i].push(shiftedRow[i]);
      }
    } else {
      shiftedTiles.push(shiftedRow);
    }
  }

  let gameOver = false;

  if (numFilledTiles < 16) {
    //place random tile.
    const item = emptyTiles[rng(0, emptyTiles.length, randomLocation)];
    const randomTile = {
      ...item.emptyTile,
      key: createKey(),
      filled: true,
      isNew: true,
      filledPtr: filledTiles.length,
      value: twoOrFour,
    };
    shiftedTiles[item.row][item.col] = randomTile;
    filledTiles.push(randomTile);

    numFilledTiles++;
  }

  if (numFilledTiles === 16) {
    gameOver = true;

    let directionList = Object.values(directions);
    let i = 0;
    while (gameOver && i < directionList.length) {
      if (canMove(shiftedTiles, directionList[i])) {
        gameOver = false;
      }
      i++;
    }
  }

  console.log("gameover = " + gameOver);
  return {tiles: shiftedTiles, filledTiles: filledTiles, gameOver};
}

function removeTiles(state) {
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  if (filledTiles.length === state.filledTiles.length) { //nothing removed, no need to re-render
    return state;
  }

  let tiles = state.tiles;

  filledTiles.forEach((el, index) => {
    el.filledPtr = index;
  });
  return {tiles, filledTiles: filledTiles};
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SWIPE_TILES:
      return {...state, ...swipeTiles(state, action), move: true};

    case START_MOVING:
      return {...state, moving: true};

    case STOP_MOVING:
      return {...state, ...removeTiles(state), moving: false};

    default:
      return state;
  }
}
