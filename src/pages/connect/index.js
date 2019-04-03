'use strict';
import React, {Component} from 'react';
import { Link } from 'dva/router';
import styles from './index.less';
import { connect } from 'dva';
import {
  Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete,
} from 'antd';


@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Send extends Component {
  state ={
    checked: false,
  }
  render() {
    const {address} = this.props;
    return (<div className={styles.container}>

        <div className={styles.title}>Connecting to a Node</div>
        <div className={styles.remind}>
          Your wallet must always have a running Grin node to talk to. The node should be fully synced.
        </div>

        <ul className={styles.list}>
          <li className={styles.selected}>
            <div className={styles.head}>
              Run a local grin node (Recommanded)
            </div>
            <div className={styles.body}>

              Enter port to listen: <Input style={{display: 'inline-block', width: 400 }} />
            </div>
          </li>

          <li className={styles.item}>
            <div className={styles.head}>
              Run a local grin node (Recommanded)
            </div>
            <div className={styles.body}>

            </div>
          </li>

          <li className={styles.item}>
            <div className={styles.head}>
              Run a local grin node (Recommanded)
            </div>
            <div className={styles.body}>

            </div>
          </li>
        </ul>

        <div className={styles.handles}>
          <span className={styles.back}>Back</span>
          <span className={styles.next}>Next</span>
        </div>
      </div>
    );
  }
}
