import React, { Component } from 'react';

import classes from './Layout.module.css';
import Game from "../Game/Game";

class Layout extends Component {
  render() {
    return <div className={classes.Layout}>
      <Game />
    </div>
  }
}

export default Layout;