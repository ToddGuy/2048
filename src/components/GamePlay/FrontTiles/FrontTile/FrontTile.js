import React from 'react';

import classes from './FrontTile.module.css';

export default class FrontTile extends React.Component {

  componentWillUnmount() {
    console.log("COMPONENT WILL UNMOUNT");
  }
  render() {
    const innerClassName = (this.props.isNew) ? classes.InnerNew : classes.Inner;
    return (

     <div className={classes.FrontTile} style={this.props.style}>
       <div className={innerClassName}>
         { this.props.children }
       </div>
     </div>
  )
  }
}

// const frontTile = props => {
//   const innerClassName = (props.isNew) ? classes.InnerNew : classes.Inner;
//    return (
//      <div className={classes.FrontTile} style={props.style}>
//        <div className={innerClassName}>
//          { props.children }
//        </div>
//      </div>
//    );
// };
//
// export default frontTile;