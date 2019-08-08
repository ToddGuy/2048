import React from 'react';
import {connect} from "react-redux";

import classes from './Points.module.css';

const points = (props) => (
  <span className={classes.Points}>{props.points}</span>
);


const mapStateToProps = ({points}) => {
  return {
    points
  };
};

export default connect(mapStateToProps)(points);