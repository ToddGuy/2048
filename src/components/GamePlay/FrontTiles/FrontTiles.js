import React from 'react';

import { connect } from 'react-redux';

import FrontTile from './FrontTile/FrontTile';
import classes from './FrontTiles.module.css';
import {CSSTransition, TransitionGroup} from "react-transition-group";
import "./FrontTile/FrontTileTransition.css";

const frontTiles = ({ filledTiles }) => {
  console.log("\n\nrender fronttiles\n\n");
  return (
    <div className={classes.FrontTiles}>
        { filledTiles.map(el => (
            <FrontTile
              isNew = {el.isNew}
              style={{transform: `translateX(${el.xAxisPos}px) translateY(${el.yAxisPos}px)`}}
              key={el.key}>
              {el.value}
            </FrontTile>

          // <CSSTransition in={el.in} appear={true} timeout={10000} classNames="tile" key={el.key} unmountOnExit>
          // </CSSTransition>
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
