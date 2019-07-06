import {SWIPE_TILES, START_MOVING, STOP_MOVING} from "./actionTypes";
import {canMove, chooseTwoOrFour} from "../utils/data";

export const swipeTiles = (direction, randomLocation, twoOrFour) => {
  return {
    type: SWIPE_TILES,
    payload: {
      direction, randomLocation, twoOrFour
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

    /* need this canMove for cases where tiles are up against edge and you press towards the edge
     * really fast and then another direction; without this it won't move
     */
    if (canMove(tiles, direction)) {
      dispatch(startMoving());
      dispatch(swipeTiles(direction, Math.random(), chooseTwoOrFour(Math.random())));
      setTimeout(() => dispatch(stopMoving()), 100);
    }
  };
};



