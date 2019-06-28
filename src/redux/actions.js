import { SWIPE_TILES, START_MOVING, STOP_MOVING } from "./actionTypes";

export const swipeTilesActionCreator = direction => {
  return {
    type: SWIPE_TILES,
    payload: {
      direction: direction
    }
  }
};

export const startMoving = () => {
  return {
    type: START_MOVING,
  }
};

export const stopMoving = () => {
  return {
    type: STOP_MOVING,
  }
};

export const swipeTiles = direction => {
  return (dispatch, getState) => {
    const { moving, tiles } = getState();
    if (moving) {
      return;
    }

    //if can't move, return

    if (canMove(tiles, direction)) {
      dispatch(startMoving());
      dispatch(swipeTilesActionCreator((direction)));
      setTimeout(() => dispatch(stopMoving()), 100);
    }


  };
};

const canMove = (tiles, direction) => { //need this for cases where tiles are up against edge and you press towards the edge really fast and then another direction; without this it won't move

  let rowTraverseCondition;
  let colTraverseCondition;
  let shift;
  let swapRowCol = false;
  let startRow;
  let startCol;
  let getTile;


  switch (direction) {
    case 38: //up
      swapRowCol = true;
    case 37: //left
      rowTraverseCondition = (row) => row > -1;
      colTraverseCondition = (col) => col > 0;
      shift = (num) => --num;
      startRow = 3;
      startCol = 3;
      getTile = (row, col) => swapRowCol ?
        { tile: tiles[col][row], nextTile: tiles[col - 1][row] } :
        { tile: tiles[row][col], nextTile: tiles[row][col - 1] };
      break;

    case 40: //down
      swapRowCol = true;
    case 39: //right
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
      return false; //TODO
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



function getRandomTilePos(tiles) {
  const emptyTiles = tiles.reduce((rowObj, row, rowIndex) => {
    const reduced = row.reduce((acc, cur, colIndex) => {
      if (!cur.filled) {
        acc.push(colIndex);
      }
      return acc;
    }, []);

    if (reduced.length !== 0)
      rowObj[rowIndex] = reduced;

    return rowObj;
  }, {});


}
