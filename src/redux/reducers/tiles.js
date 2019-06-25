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
        key: generateKey(),
        filledPtr: -1
      };
    };

    for (let i = 0 ; i < 16; i++)
      fn();

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

    // tiles[1][0] = {
    //   ...tiles[1][0],
    //   filled: true,
    //   value: 4,
    //   isNew: true,
    //   isMerged: false
    // };
    //
    // tiles[3][0] = {
    //   ...tiles[3][0],
    //   filled: true,
    //   value: 4,
    //   isNew: true,
    //   isMerged: false
    // };

    return tiles;
  })();

  this.tiles = tiles;
  let i = 0; //position in list
  this.filledTiles = tiles.reduce((acc, row) => {
    return acc.concat(...row.reduce((accInner, col) => {
      if (col.filled) {
        col.filledPtr = i++;
        console.log(accInner);
        accInner.push(col);
      }
      return accInner;
    }, [])) }, []);
};

function swipeTilesUp(state) {
  console.log("swipe tiles up");
  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  const shiftedTiles = [[], [], [], []];
  let q = new Queue();
  for (let row = 0; row < 4; row++) {
    let shiftedRow = [];
    let cur = 0; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (cur < 4) {
      if (tiles[cur][row].filled) {

        q.push(tiles[cur][row]);

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
              xAxisPos: tiles[pos][row].xAxisPos,
              yAxisPos: tiles[pos][row].yAxisPos,
              row: pos, col: row
            };

            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length;
            filledTilesCopy.push(shiftedTile);
          } else {
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[pos][row].xAxisPos,
              yAxisPos: tiles[pos][row].yAxisPos,
              filled: true,
              isNew: false,
              row: pos,
              col: row,
              filledPtr: index
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos++] = shiftedTile;
        }
      }
      cur++;
    }

    if (!q.isEmpty()) { //last cell
      let shiftedTile = {...q.pop(), isNew: false, isMerged: false };
      const index = shiftedTile.filledPtr;
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[pos][row].xAxisPos,
        yAxisPos: tiles[pos][row].yAxisPos,
        filled: true,
        isNew: false,
        row: pos,
        col: row,
        filledPtr: index
      };
      shiftedTile = filledTilesCopy[index];
      shiftedRow[pos++] = {...shiftedTile, isNew: false, isMerged: false};
    }

    filledTiles = filledTilesCopy;

    const empty = {
      filled: false,
      isNew: false,
      isMerged: false,
      value: -1
    };

    while (pos < 4) {
      const emptyTile = {...empty};
      emptyTile.yAxisPos = tiles[pos][row].yAxisPos;
      emptyTile.xAxisPos = tiles[pos][row].xAxisPos;
      shiftedRow[pos++] = emptyTile;
    }

    console.log(shiftedRow);
    for (let i = 0; i < 4; i++) {
      shiftedTiles[i].push(shiftedRow[i]);
    }
  }

  console.log("tiles: ", tiles);
  console.log("shiftedTiles: ", shiftedTiles);
  console.log("filledTiles: ", filledTiles);

  return {tiles: shiftedTiles, filledTiles: filledTiles};
}

function swipeTilesDown(state) {
  console.log("swipe tiles down");
  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  const shiftedTiles = [[], [], [], []];
  let q = new Queue();
  for (let row = 0; row < 4; row++) {
    let shiftedRow = [];
    let cur = 3; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (cur > -1) {
      if (tiles[cur][row].filled) {

        q.push(tiles[cur][row]);

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
              xAxisPos: tiles[pos][row].xAxisPos,
              yAxisPos: tiles[pos][row].yAxisPos,
              row: pos, col: row
            };

            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length;
            filledTilesCopy.push(shiftedTile);
          } else {
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[pos][row].xAxisPos,
              yAxisPos: tiles[pos][row].yAxisPos,
              filled: true,
              isNew: false,
              row: pos,
              col: row
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos--] = shiftedTile;
        }
      }
      cur--;
    }

    if (!q.isEmpty()) { //last cell
      let shiftedTile = {...q.pop(), isNew: false, isMerged: false };
      const index = shiftedTile.filledPtr;
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[pos][row].xAxisPos,
        yAxisPos: tiles[pos][row].yAxisPos,
        filled: true,
        isNew: false,
        row: pos,
        col: row,
        filledPtr: index
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
      emptyTile.yAxisPos = tiles[pos][row].yAxisPos;
      emptyTile.xAxisPos = tiles[pos][row].xAxisPos;
      shiftedRow[pos--] = emptyTile;
    }

    console.log(shiftedRow);
    for (let i = 0; i < 4; i++) {
      shiftedTiles[i].push(shiftedRow[i]);
    }
  }

  console.log("tiles: ", tiles);
  console.log("shiftedTiles: ", shiftedTiles);
  console.log("filledTiles: ", filledTiles);

  return {tiles: shiftedTiles, filledTiles: filledTiles};
}

function swipeTilesLeft(state) {

  console.log("swipeTilesLeft!");

  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  const shiftedTiles = [];
  let q = new Queue();
  for (let row = 0; row < 4; row++) {
    let shiftedRow = [];
    let cur = 0; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (cur < 4) {
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

            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length;
            filledTilesCopy.push(shiftedTile);
          } else {
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[row][pos].xAxisPos,
              yAxisPos: tiles[row][pos].yAxisPos,
              filled: true,
              isNew: false,
              row: row,
              col: pos,
              filledPtr: index
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos++] = shiftedTile;
        }
      }
      cur++;
    }

    if (!q.isEmpty()) { //last cell
      let shiftedTile = {...q.pop(), isNew: false, isMerged: false };
      const index = shiftedTile.filledPtr;
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[row][pos].xAxisPos,
        yAxisPos: tiles[row][pos].yAxisPos,
        filled: true,
        isNew: false,
        row: row,
        col: pos,
        filledPtr: index
      };
      shiftedTile = filledTilesCopy[index];
      shiftedRow[pos++] = {...shiftedTile, isNew: false, isMerged: false};
    }

    filledTiles = filledTilesCopy;

    const empty = {
      filled: false,
      isNew: false,
      isMerged: false,
      value: -1
    };

    while (pos < 4) {
      const emptyTile = {...empty};
      emptyTile.yAxisPos = tiles[row][pos].yAxisPos;
      emptyTile.xAxisPos = tiles[row][pos].xAxisPos;
      shiftedRow[pos++] = emptyTile;
    }

    shiftedTiles.push(shiftedRow);
  }

  console.log("tiles: ", tiles);
  console.log("shiftedTiles: ", shiftedTiles);
  console.log("filledTiles: ", filledTiles);

  return {tiles: shiftedTiles, filledTiles: filledTiles};
}

function swipeTiles(state, { payload: { direction } }) {

  console.log("direction: ", direction);

  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  filledTiles.forEach((el, index) => {
    tiles[el.row][el.col].filledPtr = index;
    el.filledPtr = index;
  });

  if (direction === 40) {
    return swipeTilesDown(state)
  } else if (direction === 37) {
    return swipeTilesLeft(state);
  } else if (direction === 38) {
    return swipeTilesUp(state);
  }

  const shiftedTiles = [];
  let q = new Queue();
  for (let row = 0; row < 4; row++) {
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

            // const backIndex = filledTiles.findIndex(el => el.row === back.row && el.col === back.col);
            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            // const frontIndex = filledTiles.findIndex(el => el.row === front.row && el.col === front.col);
            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length; console.log(row, pos, filledTilesCopy.length);
            filledTilesCopy.push(shiftedTile);
          } else {
            // const curItem = shiftedTile;
            // const index = filledTiles.findIndex(el => el.row === curItem.row && el.col === curItem.col && !el.remove);
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[row][pos].xAxisPos,
              yAxisPos: tiles[row][pos].yAxisPos,
              filled: true,
              isNew: false,
              row: row,
              col: pos,
              filledPtr: index
            };

            shiftedTile = filledTilesCopy[index];
          }

          shiftedRow[pos--] = shiftedTile;
        }
      }
      cur--;
    }

    if (!q.isEmpty()) { //last cell
      let shiftedTile = {...q.pop(), isNew: false, isMerged: false };
      const index = shiftedTile.filledPtr;
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[row][pos].xAxisPos,
        yAxisPos: tiles[row][pos].yAxisPos,
        filled: true,
        isNew: false,
        row: row,
        col: pos,
        filledPtr: index
      };
      shiftedTile = filledTilesCopy[index];
      shiftedRow[pos--] = {...shiftedTile, isNew: false, isMerged: false};
    }

    filledTiles = filledTilesCopy;

    const empty = {
      filled: false,
      isNew: false,
      isMerged: false,
      value: -1,
      filledPtr: -1
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

function swipeTilesV2(state, { payload: { direction } }) {

  console.log("direction: ", direction);

  const tiles = state.tiles;
  let filledTiles = state.filledTiles.filter((el) => !el.remove);

  filledTiles.forEach((el, index) => {
    tiles[el.row][el.col].filledPtr = index;
    el.filledPtr = index;
  });

  let rowTraverseCondition;
  let shift;
  let traverse;
  let swapRowCol = false;

  if (direction === 40) { //down
    // rowTraverseCondition = (x) => x > -1;
    // shift = (x) => --x;
    // traverse = 3;
    // swapRowCol = true;
    swipeTilesDown(state);
  } else if (direction === 37) { //left
    rowTraverseCondition = (x) => x < 4;
    shift = (x) => ++x;
    traverse = 0;
  } else if (direction === 38) { //up
    return swipeTilesUp(state);
  } else if (direction === 39) { //right
    rowTraverseCondition = (x) => x > -1;
    shift = (x) => --x;
    traverse = 3;
  }

  const shiftedTiles = [];
  let q = new Queue();
  for (let row = 0; row < 4; row++) {
    let shiftedRow = [];
    let cur = traverse; //will keep going through all, only stopping when it finds filled cell.
    let pos = cur; //will always keep pointed to next cell to fill

    const filledTilesCopy = [...filledTiles];

    while (rowTraverseCondition(cur)) {
      console.log(cur);
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

            // const backIndex = filledTiles.findIndex(el => el.row === back.row && el.col === back.col);
            const backIndex = back.filledPtr;
            filledTilesCopy[backIndex] = {...filledTiles[backIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            // const frontIndex = filledTiles.findIndex(el => el.row === front.row && el.col === front.col);
            const frontIndex = front.filledPtr;
            filledTilesCopy[frontIndex] = {...filledTiles[frontIndex], filledPtr: -1, xAxisPos: shiftedTile.xAxisPos, yAxisPos: shiftedTile.yAxisPos, remove: true, filled: false};

            shiftedTile.filledPtr = filledTilesCopy.length; console.log(row, pos, filledTilesCopy.length);
            filledTilesCopy.push(shiftedTile);
          } else {
            // const curItem = shiftedTile;
            // const index = filledTiles.findIndex(el => el.row === curItem.row && el.col === curItem.col && !el.remove);
            const index = shiftedTile.filledPtr;

            filledTilesCopy[index] = {
              ...filledTiles[index],
              xAxisPos: tiles[row][pos].xAxisPos,
              yAxisPos: tiles[row][pos].yAxisPos,
              filled: true,
              isNew: false,
              row: row,
              col: pos,
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
      filledTilesCopy[index] = {
        ...filledTiles[index],
        xAxisPos: tiles[row][pos].xAxisPos,
        yAxisPos: tiles[row][pos].yAxisPos,
        filled: true,
        isNew: false,
        row: row,
        col: pos,
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
      emptyTile.yAxisPos = tiles[row][pos].yAxisPos;
      emptyTile.xAxisPos = tiles[row][pos].xAxisPos;
      shiftedRow[pos] = emptyTile;
      pos = shift(pos);
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
      return {...state, ...swipeTilesV2(state, action)};

    default:
      return state;
  }
}
