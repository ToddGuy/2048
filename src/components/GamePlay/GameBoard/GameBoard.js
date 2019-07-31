import React from 'react';

import { connect } from "react-redux";

import classes from './GameBoard.module.css';
import BackTiles from "../BackTiles/BackTiles";
import FrontTiles from "../FrontTiles/FrontTiles";
import Auxiliary from "../../hoc/Auxiliary/Auxiliary";

const gameBoard = ({gameOver, restartDialog}) => {
  const classList = [classes.GameBoard];

  let content;

  console.log("test");
  if (gameOver) {
    classList.push(classes.GameBoardOverlay);
  } else if (restartDialog) {
    classList.push(classes.GameBoardOverlay);
  } else {
    content = (
      <Auxiliary>
        <BackTiles />
        <FrontTiles />
      </Auxiliary>
    );
  }

  return (
    <div className={classList.join(" ")}>
      { content }
    </div>
  )
};

const mapStateToProps = ({ gameOver, restart }) => {
  return { gameOver, restart };
};

export default connect(mapStateToProps)(gameBoard);