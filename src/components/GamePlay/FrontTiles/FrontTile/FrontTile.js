import React from 'react';

import classes from './FrontTile.module.css';

export default class FrontTile extends React.Component {
  render() {
    const innerClassName = (this.props.isNew) ? classes.InnerNew : classes.Inner;
    const len = String(this.props.children).length;
    let style = {};
    if (len > 3) {
      style.fontSize = "28px";
    }

    return (
        <div className={classes.FrontTile} style={this.props.style}>
            <div className={innerClassName} style={style}>
              { this.props.children }
            </div>
        </div>

    )
  }
}

