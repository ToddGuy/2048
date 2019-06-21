import React from 'react';

import classes from './BackTiles.module.css';

const backTiles = props => {
  return (
    <div className={classes.BackTiles} >
      {
        [...Array(16).keys()].map((_, index) =>  <div key={index} className={classes.BackTile}/>)
      }
    </div>
  );
};

export default backTiles;