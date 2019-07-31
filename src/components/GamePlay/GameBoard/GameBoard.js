import React from 'react';

import { connect } from "react-redux";

import classes from './GameBoard.module.css';
import BackTiles from "../BackTiles/BackTiles";
import FrontTiles from "../FrontTiles/FrontTiles";
import Auxiliary from "../../hoc/Auxiliary/Auxiliary";
import Backdrop from "./Backdrop/Backdrop";
import RestartDialog from "./RestartDialog/RestartDialog";

const gameBoard = ({gameOver, restartDialog, doRestart, cancelRestart}) => {
  const classList = [classes.GameBoard];

  let backdrop = null;
  let overlay = null;

  if (gameOver) {
    backdrop = <Backdrop />;
  } else if (restartDialog) {
    backdrop = <Backdrop />;
    overlay = <RestartDialog />;
  }

  let content = (
    <Auxiliary>
      {overlay}
      {backdrop}
      <BackTiles />
      <FrontTiles />
    </Auxiliary>
  );

  return (
    <div className={classList.join(" ")}>
      { content }
    </div>
  )
};

const mapStateToProps = ({ gameOver }) => {
  return { gameOver };
};

export default connect(mapStateToProps)(gameBoard);