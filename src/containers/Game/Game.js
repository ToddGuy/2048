import React, { Component } from 'react';

import classes from './Game.module.css';
import GameBoard from '../../components/GamePlay/GameBoard/GameBoard';
import {connect} from "react-redux";
import {swipeTiles} from "../../redux/actions";

class Game extends Component {

  constructor(props) {
    super(props);
    this.swipeTiles = this.swipeTiles.bind(this);
  }

  swipeTiles(keyCode) {
    this.props.swipeTiles(keyCode);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.swipeTiles);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.swipeTiles);
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
    swipeTiles: (event) => dispatch(swipeTiles(event.keyCode))
  };
};

export default connect(null, mapDispatchToProps)(Game);