import React from 'react';

import classes from './RestartDialog.module.css';

const restartDialog = ({ clicked }) => {
  return (
    <div className={classes.RestartDialog}>
      <span className={classes.Dialog}>Restart Game?</span>
      <div>
        <button className={classes.Button} onClick={() => clicked(true)}>YES</button>
        <button className={classes.Button} onClick={() => clicked(false)}>NO</button>
      </div>
    </div>
  );
};

export default restartDialog;