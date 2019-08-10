import React from 'react';
import {connect} from "react-redux";

import classes from './Points.module.css';

const points = (props) => (
  <div className={classes.Points}><span>Score:</span> {props.points}</div>
);


const mapStateToProps = ({points}) => {
  return {
    points
  };
};

export default connect(mapStateToProps)(points);