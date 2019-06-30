import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import {connect} from "react-redux";
import {swipeTiles} from "../../redux/actions";
import {range} from "../../utils/helper";

class Game extends Component {

  rangeDirections =  range(37, 41);

  constructor(props) {
    super(props);
    this.directionHandler = this.directionHandler.bind(this);
  }

  directionHandler(event) {
    if (this.rangeDirections.indexOf(event.keyCode) !== -1) {
      console.log(event.keyCode);
      this.props.swipeTiles(event);
    }
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