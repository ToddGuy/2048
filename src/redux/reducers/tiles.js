import { SWIPE_TILES } from '../actionTypes';
import { Queue } from "../../utils/ds";

const generateKey = (function() {
  let i = 0;
  return () => i++;
})();

const initialState = {
  tiles: (function(){
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

    let fn = function() {
      const range = (min, max) => Math.floor(Math.random() * (max - min)) + min;
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
        key: generateKey()
      };
    };

    fn();
    fn();

    return tiles;
  })(),
};

function moveTiles(tiles, direction) {
  const empty = {
    filled: false,
    value: -1
  };

  const shiftedTiles = [];
  let q = new Queue();
  for (let row = 0; row < tiles.length; row++) {
    let shiftedRow = [];
    let cur = 3; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    while (cur > -1) {
      if (tiles[row][cur].filled) {

        delete tiles[row][cur].history;
        q.push(tiles[row][cur]);

        if (q.getLength() === 2) {
          const front = q.pop();
          const shiftedTile = {...front, isNew: false};

          let back;
          if (front.value === q.peek().value) {
            back = q.pop();
            shiftedTile.value = front.value * 2;
          }

          const posTile = tiles[row][pos];
          shiftedTile.yAxisPos = posTile.yAxisPos;
          shiftedTile.xAxisPos = posTile.xAxisPos;
          shiftedTile.history = {
            first: {...front},
          };
          if (back !== undefined) {
            shiftedTile.history.second = {...back}
          }
          shiftedRow.unshift(shiftedTile);
          pos--;
        }
      }
      cur--;
    }

    if (!q.isEmpty()) { //last cell
      const front = q.pop();
      const popped = {...front, isNew: false};
      popped.yAxisPos = tiles[row][pos].yAxisPos;
      popped.xAxisPos = tiles[row][pos].xAxisPos;
      popped.history = {
        first: {...front}
      };
      shiftedRow.unshift(popped);
      pos--;
    }

    while (pos > -1) {
      const emptyTile = {...empty};
      emptyTile.yAxisPos = tiles[row][pos].yAxisPos;
      emptyTile.xAxisPos = tiles[row][pos].xAxisPos;
      shiftedRow.unshift(emptyTile);
      pos--;
    }

    shiftedTiles.push(shiftedRow);
  }

  console.log("tiles: ", tiles);
  console.log("shiftedTiles: ", shiftedTiles);


  return shiftedTiles;
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SWIPE_TILES:
      return {...state, tiles: moveTiles(state.tiles, action.payload)};

    default:
      return state;
  }
}