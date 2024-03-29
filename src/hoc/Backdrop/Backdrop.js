import React from 'react';

import classes from './Backdrop.module.css';

const backdrop = (props) => (
  <div className={[classes.Backdrop, (props.init) ? "" : (props.display) ? classes.BackdropIn : classes.BackdropOut].join(" ")} >
    {props.children}
  </div>
);

export default backdrop;