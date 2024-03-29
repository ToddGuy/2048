import React, {Component, Fragment} from 'react';

import classes from './Game.module.css';

import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import { connect } from "react-redux";
import {initTiles, swipeTiles, undoMove} from "../../redux/actions";
import { range } from "../../utils/utility";
import { directions } from "../../utils/data";
import GameOver from "../../components/GamePlay/GameBoard/GameOver/GameOver";
import Backdrop from "../../hoc/Backdrop/Backdrop";
import RestartDialog from "../../components/GamePlay/GameBoard/RestartDialog/RestartDialog";
import Points from "../../components/Points/Points";
import { FaRedo, FaHistory } from 'react-icons/fa';
import Button from "../../components/UI/Button/Button";

class Game extends Component {

  state = {
    restartDialog: false
  };

  playable = true;

  directionKeyCodes =  range(37, 41).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});

  removeListenerCallbackList = [];

  constructor(props) {
    super(props);

    this.directionHandler = this.directionHandler.bind(this);
    this.showRestartDialog = this.showRestartDialog.bind(this);
    this.restartClicked = this.restartClicked.bind(this);
    this.undoMove = this.undoMove.bind(this);
  }

  directionHandler(event) {
    if (this.playable && this.directionKeyCodes[event.keyCode]) {
      this.props.swipeTiles(event.keyCode, this.generateRands());
    }
  }

  moveHandler(prevCoordinates, removeEventListenerCb, event) {

    if (this.playable) {
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
    if (!JSON.parse(window.localStorage.getItem("saveGame"))) {
      this.props.initTiles(this.getRands());
    }

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

  showRestartDialog() {
    if (this.props.gameOver) {
      this.restartClicked(true);
    } else {
      this.playable = false;
      this.setState({
        restartDialog: true,
      });
    }
  }

  generateRands() {
    return  [...Array(2)].map(() => Math.random());
  }

  //yes was clicked
  restartClicked(doRestart) {
    if (doRestart) {
      this.props.initTiles(this.getRands(), true);
    }

    this.playable = true;
    this.setState({restartDialog: false});
  }

  undoMove() {
    if (this.playable || this.props.gameOver) {
      this.props.undoMove();
    } //else if (!this.playable) {

  }

  getRands() { //for when we initialize, we'll need 6 different random nums
    return [...Array(6)].map(() => Math.random())
  }

  render() {
    return (
      <div className={classes.Game}>
        <div className={classes.Header}>2048</div>
        <div className={classes.Horizontal}>
          <Points />
          <Button onClick={this.undoMove}><FaHistory /></Button>
          <Button onClick={this.showRestartDialog}><FaRedo/></Button>
        </div>
        <div>
          <GameBoard>
            {
              (
                <Fragment>
                  <Backdrop display={!this.props.gameOver && this.state.restartDialog}>
                    <RestartDialog clicked={this.restartClicked}/>
                  </Backdrop>
                  <Backdrop display={this.props.gameOver}>
                    <GameOver/>
                  </Backdrop>
                </Fragment>
              )
            }
          </GameBoard>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    swipeTiles: (direction, rands) => dispatch(swipeTiles(direction, rands)),
    initTiles: (rands, shouldRestart) => dispatch(initTiles(rands, shouldRestart)),
    undoMove: () => dispatch(undoMove())
  };
};

const mapStateToProps = ({gameOver}) => {
  return {
    gameOver
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);