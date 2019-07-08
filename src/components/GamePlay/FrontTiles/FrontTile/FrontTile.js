import React from 'react';

import classes from './FrontTile.module.css';
import { colorMap } from "../../../../utils/data";

export default class FrontTile extends React.Component {
  render() {
    const innerClasses = [
      classes.Inner,
      (this.props.isNew) ? classes.InnerNew : classes.InnerExisting
    ];

    if (this.props.isMerged) {
      innerClasses.push(classes.MergedTile);
    }

    const len = String(this.props.children).length;
    const innerStyle = {
      ...colorMap.getColor(this.props.children)
    };

    if (len > 3) {
      const fontSize = 28 - (4 * (len  - 4)); //for every additional number, subtract 4px.
      innerStyle.fontSize = `${fontSize}px`;
    }

    return (
        <div className={classes.FrontTile} style={this.props.style}>
            <div className={innerClasses.join(" ")} style={innerStyle}>
              { this.props.children }
            </div>
        </div>

    )
  }
}

