import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import {connect} from "react-redux";
import {swipeTiles} from "../../redux/actions";

class Game extends Component {


  constructor(props) {
    super(props);
    this.directionHandler = this.directionHandler.bind(this);
  }

  directionHandler(event) {
    this.props.swipeTiles(event);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.directionHandler);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.directionHandler);
  }

  render() {
    console.log("render");
    return (
      <div className={classes.Game} >
        <GameBoard />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    swipeTiles: (event) => dispatch(swipeTiles(event.keyCode))
  };
};

export default connect(null, mapDispatchToProps)(Game);