import React, {Fragment} from 'react';

import classes from './GameBoard.module.css';
import BackTiles from "../BackTiles/BackTiles";
import FrontTiles from "../FrontTiles/FrontTiles";

const gameBoard = (props) => {
  return (
    <div className={classes.GameBoard}>
      { props.children }
      <Fragment>
        <BackTiles />
        <FrontTiles />
      </Fragment>
    </div>
  )
};

export default gameBoard;