import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import { connect } from "react-redux";
import { swipeTilesSequence } from "../../redux/actions";
import { range } from "../../utils/helper";
import { directions } from "../../utils/data";

class Game extends Component {

  directionKeyCodes =  range(37, 41).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});

  removeListenerCallbackList = [];

  constructor(props) {
    super(props);
    this.directionHandler = this.directionHandler.bind(this);
  }

  directionHandler(event) {
    if (this.directionKeyCodes[event.keyCode]) {
      this.props.swipeTiles(event.keyCode);
    }
  }

  moveHandler = function(prevCoordinates, removeEventListenerCb, event) {

    const [prevX, prevY] = prevCoordinates;
    const [curX, curY] = (event.touches === undefined) ? [event.clientX, event.clientY] : [event.touches[0].clientX, event.touches[0].clientY];
    const offSet = 30;

    /*
     * if delta x is greater than delta y, it means you covered more distance on x axis,
     * which in turn means that your swipe movement was closer to the x-axis than to the y.
     */
    if (Math.abs(curX - prevX) > Math.abs(curY - prevY)) {
      if (curX < prevX - offSet) {
        this.props.swipeTiles(directions.left);
        removeEventListenerCb();
      } else if (curX > prevX + offSet) {
        this.props.swipeTiles(directions.right);
        removeEventListenerCb();
      }
    } else {
      if (curY < prevY - offSet) {
        this.props.swipeTiles(directions.up);
        removeEventListenerCb();
      } else if (curY > prevY + offSet) {
        this.props.swipeTiles(directions.down);
        removeEventListenerCb();
      }
    }

  };

  componentDidMount() {
    document.addEventListener("keydown", this.directionHandler);
    this.removeListenerCallbackList.push(() => document.removeEventListener("keydown", this.directionHandler));

    const touchStartHandler = (event) => {
      const mouseMoveHandler = this.moveHandler.bind(this, [event.touches[0].clientX, event.touches[0].clientY], () => {
        document.removeEventListener("touchmove", mouseMoveHandler);
        document.removeEventListener("touchend", removeMouseMoveHandler);
      });

      const removeMouseMoveHandler = () => {
        document.removeEventListener("touchmove", mouseMoveHandler);
        document.removeEventListener("touchend", removeMouseMoveHandler);
      };

      document.addEventListener("touchmove", mouseMoveHandler);
      document.addEventListener("touchend", removeMouseMoveHandler);
    };
    document.addEventListener("touchstart", touchStartHandler);
    this.removeListenerCallbackList.push(() => document.removeEventListener("touchstart", touchStartHandler));

    const touchEndHandler = event => { event.preventDefault(); };
    document.addEventListener("touchend", touchEndHandler);//prevents touch event from propagating to mouse events
    this.removeListenerCallbackList.push(() => document.removeEventListener("touchend", touchEndHandler));

    const mouseDownHandler = (event) => {
      const mouseMoveHandler = this.moveHandler.bind(this, [event.clientX, event.clientY], () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", removeMouseMoveHandler);
      });

      const removeMouseMoveHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", removeMouseMoveHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", removeMouseMoveHandler);
    };
    document.addEventListener("mousedown", mouseDownHandler);
    this.removeListenerCallbackList.push(() => document.removeEventListener("mousedown", mouseDownHandler));
  }

  componentWillUnmount() {
    this.removeListenerCallbackList.forEach(cb => cb());
  }

  render() {
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