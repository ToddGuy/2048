import {SWIPE_TILES, START_MOVING, STOP_MOVING, INIT_TILES, UNDO_MOVE} from "./actionTypes";
import {canMove, chooseTwoOrFour} from "../utils/data";

const swipeTilesCreator = (direction, randomLocation, twoOrFour) => {
  return {
    type: SWIPE_TILES,
    payload: {
      direction, randomLocation, twoOrFour
    }
  }
};

const startMoving = () => {
  return {
    type: START_MOVING,
  }
};

const stopMoving = () => {
  return {
    type: STOP_MOVING,
  }
};

const undoMoveCreator = () => {
  return {
    type: UNDO_MOVE
  }
};

export const swipeTiles = (direction, [randomLocation, twoOrFourRand]) => {
  return (dispatch, getState) => {
    const { moving, tiles } = getState();
    if (moving) {
      return;
    }

    /* Check if we can move in the user inputted direction
     * Also, need this canMove for cases where tiles are up against edge and you press towards the edge
     * really fast and then another direction; without this it won't move
     */
    if (canMove(tiles, direction)) {
      dispatch(startMoving());
      dispatch(swipeTilesCreator(direction, randomLocation, chooseTwoOrFour(twoOrFourRand)));
      setTimeout(() => dispatch(stopMoving()), 100);
    }
  };
};

//shouldRestart indicates we need to reset the game
export const initTiles = (rands, shouldRestart) => {
  const [rowRand0, colRand0, rowRand1, colRand1, twoOrFourRand0, twoOrFourRand1] = rands;
  return {
    type: INIT_TILES,
    payload:  {
      rowRand0, colRand0, rowRand1, colRand1,
      twoOrFour0: chooseTwoOrFour(twoOrFourRand0), twoOrFour1: chooseTwoOrFour(twoOrFourRand1),
      shouldRestart
    }
  }
};

export const undoMove = () => {
  return (dispatch, getState) => {
    const { used } = getState().lastMove;
    if (used) {
      return;
    }
    dispatch(startMoving());
    dispatch(undoMoveCreator());
    setTimeout(() => dispatch(stopMoving()), 100);
  }
};


