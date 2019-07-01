import {SWIPE_TILES, START_MOVING, STOP_MOVING} from "./actionTypes";
import {canMove} from "../utils/helper";

export const swipeTiles = (direction, randomNum) => {
  return {
    type: SWIPE_TILES,
    payload: {
      direction, randomNum
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

export const swipeTilesSequence = direction => {
  return (dispatch, getState) => {
    const { moving, tiles } = getState();
    if (moving) {
      return;
    }

    /* need this for cases where tiles are up against edge and you press towards the edge
     * really fast and then another direction; without this it won't move
     */
    if (canMove(tiles, direction)) {
      dispatch(startMoving());
      dispatch(swipeTiles(direction, Math.random()));
      setTimeout(() => dispatch(stopMoving()), 100);
    }
  };
};



