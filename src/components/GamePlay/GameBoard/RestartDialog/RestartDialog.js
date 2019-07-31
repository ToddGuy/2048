import React from 'react';

import classes from './RestartDialog.module.css';

const restartDialog = () => {
  return (
    <div className={classes.RestartDialog}>
      <span className={classes.Dialog}>Restart Game?</span>
      <div>
        <button className={classes.Button}>YES</button>
        <button className={classes.Button} onClick={}>NO</button>
      </div>
    </div>
  );
};

export default restartDialog;