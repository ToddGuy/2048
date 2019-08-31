import React from 'react';

import classes from './Layout.module.css';

const layout = ({children}) => (
  <div className={classes.Layout}>
    {children}
  </div>
);
export default layout;