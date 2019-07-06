import React from 'react';

import { connect } from 'react-redux';

import FrontTile from './FrontTile/FrontTile';
import classes from './FrontTiles.module.css';

const frontTiles = ({ filledTiles }) => {
  return (
    <div className={classes.FrontTiles}>
        { filledTiles.map(el => (
            <FrontTile
              isNew = {el.isNew}
              style={{transform: `translateX(${el.xAxisPos}px) translateY(${el.yAxisPos}px)`}}
              key={el.key}>
              {el.value}
            </FrontTile>
          ))
        }
    </div>
  );
};

//remove items to be removed only after positions have been changed
const mapStateToProps = ({ filledTiles }) => {
  return { filledTiles }
};

export default connect(mapStateToProps)(frontTiles);
