import { SWIPE_TILES, START_MOVING, STOP_MOVING } from "./actionTypes";
import {canMove, getRandomTilePos} from "../utils/helper";

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
      // let { tiles } = getState();
      // getRandomTilePos(tiles);
      setTimeout(() => dispatch(stopMoving()), 100);
    }


  };
};



