import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import { connect } from "react-redux";
import {initTiles, swipeTilesSequence} from "../../redux/actions";
import { range } from "../../utils/utility";
import { directions } from "../../utils/data";

class Game extends Component {

  state = {
    restartDialog: false,
    playable: true
  };

  directionKeyCodes =  range(37, 41).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});

  removeListenerCallbackList = [];

  constructor(props) {
    super(props);
    this.directionHandler = this.directionHandler.bind(this);
    this.restartDialog = this.restartDialog.bind(this);
  }

  directionHandler(event) {
    if (this.state.playable && this.directionKeyCodes[event.keyCode]) {
      this.props.swipeTiles(event.keyCode, this.generateRands());
    }
  }

  moveHandler(prevCoordinates, removeEventListenerCb, event) {

    if (this.state.playable) {
      const [prevX, prevY] = prevCoordinates;
      const [curX, curY] = (event.touches === undefined) ? [event.clientX, event.clientY] : [event.touches[0].clientX, event.touches[0].clientY];
      const offSet = 30;

      /*
       * if delta x is greater than delta y, it means you covered more distance on x axis,
       * which in turn means that your swipe movement was closer to the x-axis than to the y.
       */
      if (Math.abs(curX - prevX) > Math.abs(curY - prevY)) {
        if (curX < prevX - offSet) {
          this.props.swipeTiles(directions.left, this.generateRands());
          removeEventListenerCb();
        } else if (curX > prevX + offSet) {
          this.props.swipeTiles(directions.right, this.generateRands());
          removeEventListenerCb();
        }
      } else {
        if (curY < prevY - offSet) {
          this.props.swipeTiles(directions.up, this.generateRands());
          removeEventListenerCb();
        } else if (curY > prevY + offSet) {
          this.props.swipeTiles(directions.down, this.generateRands());
          removeEventListenerCb();
        }
      }
    }

  };

  componentDidMount() {
    this.props.initTiles([...Array(6)].map(() => Math.random()));

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

  restartDialog() {
    this.setState({
      restartDialog: true,
      playable: false
    });
  }

  generateRands() {
    return  [...Array(2)].map(() => Math.random());
  }

  componentWillUnmount() {
    this.removeListenerCallbackList.forEach(cb => cb());
  }

  render() {
    return (
      <div className={classes.Game} >
        <div className={classes.Header}>2048</div>
        <div>
          <span style={{background: "red"}}>Points: 123456789</span>
          <button>history</button>
          <button onClick={this.restartDialog}>restart</button>
        </div>
        <GameBoard restartDialog={this.state.restartDialog}/>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    swipeTiles: (direction, rands) => dispatch(swipeTilesSequence(direction, rands)),
    initTiles: (rands) => dispatch(initTiles(rands))
  };
};

export default connect(null, mapDispatchToProps)(Game);