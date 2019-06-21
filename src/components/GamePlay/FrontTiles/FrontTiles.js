import React from 'react';

import { connect } from 'react-redux';

import FrontTile from './FrontTile/FrontTile';
import classes from './FrontTiles.module.css';

const frontTiles = ({ filledTiles }) => {

  return (
    <div className={classes.FrontTiles}>
      { filledTiles.map(el => {
        return (
          <FrontTile
            isNew = {el.isNew}
            style={{transform: `translateX(${el.xAxisPos}px) translateY(${el.yAxisPos}px)`}}
            key={el.key}>
            {el.value}
          </FrontTile>
        );
      })
      }
    </div>
  );
};

const mapStateToProps = state => {
  const { tiles } = state;
  const filledTiles = [];
  tiles.forEach(tileRow => {
    const filledRow = tileRow.filter(el => el.filled);
    if (filledRow.length > 0) {
      filledTiles.push(...filledRow);
    }
  });
  return {
    filledTiles
  }
};

export default connect(mapStateToProps)(frontTiles);
