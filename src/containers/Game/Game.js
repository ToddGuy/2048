import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import {connect} from "react-redux";
import {swipeTilesSequence} from "../../redux/actions";
import {range} from "../../utils/helper";
import {directions} from "../../utils/data";

class Game extends Component {

  directionKeyCodes =  range(37, 41).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});

  constructor(props) {
    super(props);
    console.log(this.directionKeyCodes);
    console.log(directions);
    this.directionHandler = this.directionHandler.bind(this);
  }

  directionHandler(event) {
    if (this.directionKeyCodes[event.keyCode]) {
      this.props.swipeTiles(event.keyCode);
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.directionHandler);

    const mountMoveHandler = function(event) {
      console.log(event.x, event.y);
    };

    document.addEventListener("mousedown", (event) => {
      console.log(event.x, event.y);
      document.addEventListener("mousemove", mountMoveHandler);
    });

    document.addEventListener("mouseup", () => {
      console.log("removing", document.onmousedown);
      console.log("removing", document.onmousemove);
      document.removeEventListener("mousemove", mountMoveHandler);
      console.log("removing", document.onmousemove);
    })
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
    swipeTiles: direction => dispatch(swipeTilesSequence(direction))
  };
};

export default connect(null, mapDispatchToProps)(Game);