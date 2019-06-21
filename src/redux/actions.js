import { SWIPE_TILES} from "./actionTypes";

export const swipeTiles = direction => {
  return {
    type: SWIPE_TILES,
    payload: {
      direction: direction,
    }
  }
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
