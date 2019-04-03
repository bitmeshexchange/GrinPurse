'use strict';
import React, {Component} from 'react';
import styles from './index.less';

export default class Icon extends Component {
  constructor(props) {
    super(props);
  }

  onClick = ()=>{
    this.props.onClick && this.props.onClick(this.props.type)
  }

  render() {
    const {type} = this.props;
    const cls = `icon-${type}`; 

    return <i className={`iconfont ${this.props.className} ${styles[cls]}`} onClick={this.onClick}/>;
  }
}
