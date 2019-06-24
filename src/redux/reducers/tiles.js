import { SWIPE_TILES } from '../actionTypes';

import { Queue } from "../../utils/ds";
import { range, generateKey } from "../../utils/helper";

const initialState = new function(){
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
      let row = range(0, 4);
      let col = range(0, 4);
      let value = range(2, 5);
      value = (value === 3) ? 2 : value;

      if(tiles[row][col].filled === true) {
        const flip = range(0, 1);
        let rowRange = 0;
        let colRange = 0;

        if (flip === 0) {
          rowRange = 1;
        } else {
          colRange = 1;
        }
        row = (row + range(rowRange,3)) % 4;
        col = (col + range(colRange, 3)) % 4;
      }

      tiles[row][col] = {
        ...tiles[row][col],
        filled: true,
        value,
        isNew: true,
        isMerged: false,
        key: generateKey()
      };
    };

    for (let i = 0 ; i < 16; i++)
      fn();

    tiles[0][0] = {
      ...tiles[0][0],
      filled: true,
      value: 8,
      isNew: true,
      isMerged: false,
      key: generateKey(),
      in: true
    };

    // tiles[0][1] = {
    //   ...tiles[0][1],
    //   filled: true,
    //   value: 4,
    //   isNew: true,
    //   isMerged: false,
    //   key: generateKey(),
    //   in: true
    // };

    tiles[0][2] = {
      ...tiles[0][2],
      filled: true,
      value: 4,
      isNew: true,
      isMerged: false,
      key: generateKey(),
      in: true
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
  this.filledTiles = tiles.reduce((acc, row) => acc.concat(...row.filter(col => col.filled)), []);
};

function swipeTiles(state, { payload: { direction } }) {

  console.log("swipeTiles: ", state);

  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  const shiftedTiles = [];
  let q = new Queue();
  for (let row = 0; row < tiles.length; row++) {
    let shiftedRow = [];
    let cur = 3; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (cur > -1) {
      if (tiles[row][cur].filled) {

        q.push(tiles[row][cur]);

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
              key: generateKey(),
              xAxisPos: tiles[row][pos].xAxisPos,
              yAxisPos: tiles[row][pos].yAxisPos,
              row: row, col: pos
            };

            const backIndex = filledTiles.findIndex(el => el.row === back.row && el.col === back.col);
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            const frontIndex = filledTiles.findIndex(el => el.row === front.row && el.col === front.col);
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            filledTilesCopy.push(shiftedTile);
          } else {
            const curItem = shiftedTile;
            const index = filledTiles.findIndex(el => el.row === curItem.row && el.col === curItem.col && !el.remove);

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[row][pos].xAxisPos,
              yAxisPos: tiles[row][pos].yAxisPos,
              filled: true,
              isNew: false,
              row: row,
              col: pos
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos--] = shiftedTile;
        }
      }
      cur--;
    }

    if (!q.isEmpty()) { //last cell
      const front = q.pop();
      let shiftedTile = {...front, isNew: false, isMerged: false };
      const index = filledTiles.findIndex(el => el.row === shiftedTile.row && el.col === shiftedTile.col && !el.remove);
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[row][pos].xAxisPos,
        yAxisPos: tiles[row][pos].yAxisPos,
        filled: true,
        isNew: false,
        row: row,
        col: pos
      };
      shiftedTile = filledTilesCopy[index];
      shiftedRow[pos--] = {...shiftedTile, isNew: false, isMerged: false};
    }

    filledTiles = filledTilesCopy;

    const empty = {
      filled: false,
      isNew: false,
      isMerged: false,
      value: -1
    };

    while (pos > -1) {
      const emptyTile = {...empty};
      emptyTile.yAxisPos = tiles[row][pos].yAxisPos;
      emptyTile.xAxisPos = tiles[row][pos].xAxisPos;
      shiftedRow[pos--] = emptyTile;
    }

    shiftedTiles.push(shiftedRow);
  }

  console.log("tiles: ", tiles);
  console.log("shiftedTiles: ", shiftedTiles);
  console.log("filledTiles: ", filledTiles);

  return {tiles: shiftedTiles, filledTiles: filledTiles};
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SWIPE_TILES:
      return {...state, ...swipeTiles(state, action)};

    default:
      return state;
  }
}
