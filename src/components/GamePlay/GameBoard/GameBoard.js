import React from 'react';

import classes from './GameBoard.module.css';
import BackTiles from "../BackTiles/BackTiles";
import FrontTiles from "../FrontTiles/FrontTiles";
import Auxiliary from "../../hoc/Auxiliary/Auxiliary";

const gameBoard = (props) => {
  return (
    <div className={classes.GameBoard}>
      { props.children }
      <Auxiliary>
        <BackTiles />
        <FrontTiles />
      </Auxiliary>
    </div>
  )
};

export default gameBoard;