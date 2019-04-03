'use strict';
import React, {Component} from 'react';
import { routerRedux, Link } from 'dva/router';
// import { browserHistory } from 'react-router'
// import { createBrowserHistory } from 'history';

import styles from './index.less';
import QRCode from 'qrcode.react';
import CustomClipboard from 'components/clipboard';
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

  goHome() {
    const { dispatch } = this.props;
    window.localStorage.removeItem('temp_pwd');
    window.localStorage.removeItem('temp_passphrase');
    dispatch(routerRedux.push({
      pathname: 'home'
    }));
  }

  render() {
    const {block_height, status, current_height, peer_count} = this.props;
    if (block_height !== 0 && block_height === current_height) {
      this.goHome();
    }

    return (<div className={styles.container}>
        <div>
          <div className={styles.logo}></div>
        </div>
        <div className={styles.info}>Grin Purse powered by BitMesh.com</div>

        <div className={styles.statusTxt}>
        	{status || 'Syncing...'}
          <Link style={{ marginLeft: 10 }} replace={true} to="/home">Skip</Link>
        </div>
        <div className={styles.loadingContent}>
        	<div className={styles.loading}>
        	</div>
        </div>
      </div>
    );
  }
}
