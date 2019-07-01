import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import {connect} from "react-redux";
import {swipeTilesSequence} from "../../redux/actions";
import {range} from "../../utils/helper";

class Game extends Component {

  directionKeyCodes =  range(37, 41).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});

  constructor(props) {
    super(props);
    this.directionHandler = this.directionHandler.bind(this);

    console.log(this.directionKeyCodes);
  }

  directionHandler(event) {
    if (this.directionKeyCodes[event.keyCode]) {
      this.props.swipeTiles(event);
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.directionHandler);
    document.addEventListener()
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
    swipeTiles: (event) => dispatch(swipeTilesSequence(event.keyCode))
  };
};

export default connect(null, mapDispatchToProps)(Game);