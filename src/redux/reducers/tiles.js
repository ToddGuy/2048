import {INIT_TILES, START_MOVING, STOP_MOVING, SWIPE_TILES, UNDO_MOVE} from '../actionTypes';

import {Queue} from "../../utils/ds";
import {range, rng} from "../../utils/utility";
import {
  canMove,
  createEmptyTile,
  fillRandomTile,
  directions,
  markForRemoval,
  markForShift,
  getAndIncrement
} from "../../utils/data";

const InitialState = function(keyNum = 0) {
  this.tiles = (function () {
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

    return tiles;
  })();

  this.filledTiles = [];
  this.moving = false;
  this.gameOver = false;
  this.points = 0;
  this.lastMove = { used: true };
  this.key = {
    num: keyNum,
  };
  this.saveGame = false;
};

// initializes two filled random tiles in beginning
function fillRandomInitialTiles(state, {payload: {rowRand0, colRand0, rowRand1, colRand1, twoOrFour0, twoOrFour1}}) {

  const tiles = state.tiles;
  const filledTiles = [];
  const key = {...state.key};

  const arr = [...Array(4)].map(() => range(0, 4));

  let row = rng(0, arr.length, rowRand0);
  let col = arr[row][rng(0, arr[row].length, colRand0)];

  tiles[row][col] = fillRandomTile(tiles[row][col], 0, twoOrFour0, getAndIncrement(key));
  filledTiles.push(tiles[row][col]);

  arr[row].splice(col, 1);

  row = rng(0, arr.length, rowRand1);
  col = arr[row][rng(0, arr[row].length, colRand1)];


  tiles[row][col] = fillRandomTile(tiles[row][col], 1, twoOrFour1, getAndIncrement(key));
  filledTiles.push(tiles[row][col]);

  return { tiles, filledTiles, key }
}

function swipeTiles(state, { payload: { direction, randomLocation, twoOrFour } }) {
  const lastMove = state;

  const tiles = state.tiles; //tiles before shiftedTiles representation
  let points = state.points;
  let filledTiles = [...state.filledTiles];
  const key = {...state.key};

  let rowTraverseCondition;
  let shift;
  let traverse;
  let swapRowCol = false;

  const {up, left, down, right} = directions;

  switch (direction) {
    case up:
      swapRowCol = true;
    // eslint-disable-next-line
    case left:
      rowTraverseCondition = (x) => x < 4;
      shift = (x) => ++x;
      traverse = 0;
      break;

    case down:
      swapRowCol = true;
    // eslint-disable-next-line
    case right:
      rowTraverseCondition = (x) => x > -1;
      shift = (x) => --x;
      traverse = 3;
      break;

    default:
      break;
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
              key: getAndIncrement(key),
              xAxisPos: posTile.xAxisPos,
              yAxisPos: posTile.yAxisPos,
              filledPtr: filledTiles.length
            };
            filledTiles.push(shiftedTile);
            // lose ptr to tiles since we're removing after transitioning
            filledTiles[back.filledPtr] = markForRemoval(filledTiles[back.filledPtr], shiftedTile);
            filledTiles[front.filledPtr] = markForRemoval(filledTiles[front.filledPtr], shiftedTile);

            numFilledTiles--; //subtract one for every 2 replaced with 1.

            points += shiftedTile.value//add value of this merge to points
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
      const posTile = getTile(row, pos);
      const [swapRow, swapCol] = getRowCol(row, pos); //for finding and setting random tile to

      const emptyTile = {...createEmptyTile(),
        yAxisPos: posTile.yAxisPos,
        xAxisPos: posTile.xAxisPos,
        row: swapRow, col: swapCol
      };
      // emptyTile.yAxisPos = posTile.yAxisPos;
      // emptyTile.xAxisPos = posTile.xAxisPos;
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
    const emptyTile = emptyTiles[rng(0, emptyTiles.length, randomLocation)];
    const randomTile = fillRandomTile(emptyTile, filledTiles.length, twoOrFour, getAndIncrement(key));
    shiftedTiles[emptyTile.row][emptyTile.col] = randomTile;
    delete emptyTile.row; delete emptyTile.col;
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

  return {tiles: shiftedTiles, filledTiles, gameOver, points, lastMove, key, saveGame: true};
}

/*
 * removes tiles marked to be removed, also removes isNew flag so that if history is clicked, can transition smoothly
 */
function cleanUpTiles(state) {
  const filledTiles = state.filledTiles.filter((el) => !el.remove);


  if (state.lastMove.filledTiles) {
    const lastMoveFilledTiles = state.lastMove.filledTiles;

    lastMoveFilledTiles.forEach(el => {
      el.isNew = false;
    });
  }

  if (filledTiles.length === state.filledTiles.length) { //nothing removed, no need to re-render
    return state;
  }

  let tiles = state.tiles;

  //update index in array for surviving elements
  filledTiles.forEach((el, index) => {
    el.filledPtr = index;
    el.isMerged = false; //take off merged for animation to not occur
  });

  return {tiles, filledTiles, lastMove: {...state.lastMove, used: false}};
}

function undoMove(state) {
  if (state.lastMove.used) {
    return state;
  }

  return  {...state.lastMove, lastMove: {used: true}};
}

export default function(state = new InitialState(), action) {
  switch (action.type) {
    case SWIPE_TILES:
      return {...state, ...swipeTiles(state, action), move: true};

    case START_MOVING:
      return {...state, moving: true};

    case STOP_MOVING:
      return {...state, ...cleanUpTiles(state), moving: false};

    case INIT_TILES:
      if (action.payload.shouldRestart) {
        state = new InitialState(state.key.num);
      }
      return {...state, ...fillRandomInitialTiles(state, action)};

    case UNDO_MOVE:
      return undoMove(state);

    default:
      return state;
  }
}
