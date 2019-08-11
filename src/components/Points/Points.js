import React from 'react';
import {connect} from "react-redux";

import classes from './Points.module.css';

const points = (props) => (
  <div className={classes.Points}>
    <div className={classes.Text}>Score:</div> <div className={classes.Numbers}>{props.points}</div>
  </div>
);


const mapStateToProps = ({points}) => {
  return {
    points
  };
};

export default connect(mapStateToProps)(points);