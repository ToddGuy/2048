import React from 'react';

import classes from './RestartDialog.module.css';

const restartDialog = ({ clicked }) => {
  const onClick = (bool) => () => clicked(bool);

  return (
    <div className={classes.RestartDialog}>
      <span className={classes.Dialog}>Restart Game?</span>
      <div>
        <button className={classes.Button}
                onClick={onClick(true)}
                onTouchStart={onClick(true)}>YES</button>
        <button className={classes.Button}
                onClick={onClick(false)}
                onTouchStart={onClick(false)}>NO</button>
      </div>
    </div>
  );
};

export default restartDialog;