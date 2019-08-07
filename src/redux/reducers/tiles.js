import {INIT_TILES, START_MOVING, STOP_MOVING, SWIPE_TILES, RESTART} from '../actionTypes';

import {Queue} from "../../utils/ds";
import {createKey, range, rng} from "../../utils/utility";
import {canMove, createEmptyTile, fillRandomTile, directions, markForRemoval, markForShift} from "../../utils/data";

const createInitialState = function() {
  return new function() {
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

      return tiles;
    })();

    this.filledTiles = [];
    this.moving = false;
    this.gameOver = false;
  };
};

// initializes two filled random tiles in beginning
function fillRandomInitialTiles(state, {payload: {rowRand0, colRand0, rowRand1, colRand1, twoOrFour0, twoOrFour1}}) {
  const tiles = state.tiles;
  const filledTiles = [];

  const arr = [...Array(4)].map(() => range(0, 4));

  let row = rng(0, arr.length, rowRand0);
  let col = arr[row][rng(0, arr[row].length, colRand0)];


  tiles[row][col] = fillRandomTile(tiles[row][col], 0, twoOrFour0);
  filledTiles.push(tiles[row][col]);

  arr[row].splice(col, 1);

  row = rng(0, arr.length, rowRand1);
  col = arr[row][rng(0, arr[row].length, colRand1)];


  tiles[row][col] = fillRandomTile(tiles[row][col], 1, twoOrFour1);
  filledTiles.push(tiles[row][col]);

  return { tiles, filledTiles }
}

function swipeTiles(state, { payload: { direction, randomLocation, twoOrFour } }) {

  const tiles = state.tiles; //tiles before shiftedTiles representation
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
    const randomTile = fillRandomTile(item.emptyTile, filledTiles.length, twoOrFour);
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
  return {tiles, filledTiles};
}

export default function(state = createInitialState(), action) {
  switch (action.type) {
    case SWIPE_TILES:
      return {...state, ...swipeTiles(state, action), move: true};

    case START_MOVING:
      return {...state, moving: true};

    case STOP_MOVING:
      return {...state, ...removeTiles(state), moving: false};

    case INIT_TILES:
      if (action.payload.shouldRestart) {
        state = createInitialState();
      }
      return {...state, ...fillRandomInitialTiles(state, action)};

    default:
      return state;
  }
}
