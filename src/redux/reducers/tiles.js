import {SWIPE_TILES, START_MOVING, STOP_MOVING, FILL_RANDOM_TILE, REMOVE_TILES} from '../actionTypes';

import { Queue } from "../../utils/ds";
import {rng, generateKey} from "../../utils/helper";
import {directions, canMove} from "../../utils/data";

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
        key: generateKey(),
        filledPtr: -1
      };
    };

    // for (let i = 0 ; i < 16; i++)
    //   fn();

    tiles[0][0] = {
      ...tiles[0][0],
      filled: true,
      value: 2,
      isNew: true,
      isMerged: false,
      key: generateKey(),
    };

    tiles[0][1] = {
      ...tiles[0][1],
      filled: true,
      value: 4,
      isNew: true,
      isMerged: false,
      key: generateKey(),
      in: true
    };

    tiles[0][2] = {
      ...tiles[0][2],
      filled: true,
      value: 4,
      isNew: true,
      isMerged: false,
      key: generateKey(),
    };

    tiles[0][3] = {
      ...tiles[0][3],
      filled: true,
      value: 4,
      isNew: true,
      isMerged: false,
      key: generateKey(),
      in: true
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
  const getTile = (row, col, swap) => swap ? tiles[col][row] : tiles[row][col];

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

  const shiftedTiles = swapRowCol ? [[], [], [], []] : [];
  const emptyTiles = [];
  let numFilledTiles = filledTiles.length;

  let q = new Queue();
  for (let row = 0; row < 4; row++) {

    let shiftedRow = [];
    let cur = traverse; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (rowTraverseCondition(cur)) {
      const curTile = getTile(row, cur, swapRowCol);
      if (curTile.filled) {

        q.push(curTile);

        const posTile = getTile(row, pos, swapRowCol);

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
              key: generateKey(),
              xAxisPos: posTile.xAxisPos,
              yAxisPos: posTile.yAxisPos,
              row: swapRowCol? pos : row,
              col: swapRowCol? row: pos,
            };

            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length;
            filledTilesCopy.push(shiftedTile);

            numFilledTiles--; //subtract one for every 2 replaced with 1.
          } else {
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: posTile.xAxisPos,
              yAxisPos: posTile.yAxisPos,
              filled: true,
              isNew: false,
              row: swapRowCol? pos : row,
              col: swapRowCol? row: pos,
              filledPtr: index
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos] = shiftedTile;
          pos = shift(pos);
        }
      }
      cur = shift(cur);
    }

    if (!q.isEmpty()) { //last cell
      let shiftedTile = {...q.pop(), isNew: false, isMerged: false };
      const index = shiftedTile.filledPtr;
      const posTile = getTile(row, pos, swapRowCol);
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: posTile.xAxisPos,
        yAxisPos: posTile.yAxisPos,
        filled: true,
        isNew: false,
        row: swapRowCol ? pos : row,
        col: swapRowCol ? row: pos,
        filledPtr: index
      };
      shiftedTile = filledTilesCopy[index];
      shiftedRow[pos] = {...shiftedTile, isNew: false, isMerged: false};
      pos = shift(pos);
    }

    filledTiles = filledTilesCopy;

    const empty = {
      filled: false,
      isNew: false,
      isMerged: false,
      value: -1,
      filledPtr: -1
    };

    while (rowTraverseCondition(pos)) {
      const emptyTile = {...empty};
      const posTile = getTile(row, pos, swapRowCol);
      emptyTile.row = posTile.row;
      emptyTile.col = posTile.col;
      emptyTile.yAxisPos = posTile.yAxisPos;
      emptyTile.xAxisPos = posTile.xAxisPos;
      shiftedRow[pos] = emptyTile;

      emptyTiles.push(emptyTile);

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
    const randomTile = {
      ...emptyTiles[rng(0, emptyTiles.length, randomLocation)],
      key: generateKey(),
      filled: true,
      isNew: true,
      filledPtr: filledTiles.length,
      value: 2048,
    };

    shiftedTiles[randomTile.row][randomTile.col] = randomTile;

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

  let tiles = [...state.tiles];

  filledTiles.forEach((el, index) => {
    tiles[el.row][el.col].filledPtr = index;
    el.filledPtr = index;
  });
  return {tiles: tiles, filledTiles: filledTiles};
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
