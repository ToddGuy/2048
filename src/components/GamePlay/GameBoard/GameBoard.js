import React from 'react';

import classes from './GameBoard.module.css';
import BackTiles from "../BackTiles/BackTiles";
import FrontTiles from "../FrontTiles/FrontTiles";

const gameBoard = props => {

  return (
    <div className={classes.GameBoard}>
      <BackTiles />
      <FrontTiles />
    </div>
  )
};

export default gameBoard;