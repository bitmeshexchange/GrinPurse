'use strict';
import React, {Component} from 'react';
import { Popover, Button } from 'antd';
import styles from './index.less';
import {default as CustomIcon} from 'components/icon/oldIcon';
import logo from 'src/assets/wallet/logo.png';
import recvIcon from 'src/assets/wallet/receiving.png';
import sendIcon from 'src/assets/wallet/sending.png';
import { connect } from 'dva';
import routes from '../../routers/map';
import { Link } from 'dva/router';
import {version} from '../../common/config';

import { Tabs } from 'antd';
import { Row, Col } from 'antd';

import { openBrowser } from 'src/common/utils'
const TabPane = Tabs.TabPane;

function hasLayout(pathname) {
  for (let item of routes) {
    if (item.path === pathname) {
      return item.layout !== false;
    }
  }
  return true;
}

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class AppLayout extends Component {

  renderHeader() {
    return (<Row type="flex" align="top">
      <Col span={5}>Creation Time</Col>
      <Col span={10}>Txid</Col>
      <Col span={4}>Amount</Col>
      <Col span={4}>Status</Col>
    </Row>);
  }

  openUrl(url) {
    const global = window.global;
    if (typeof global !== 'undefined') {
      global.shell.openExternal(url);
    }
  }

  renderTop() {
    const {block_height, status, current_height, peer_count, connected} = this.props;

    return (
      <div className={styles.left_top}>
        <div className={styles.logo}>
          <span></span>
          {/*<img src={logo} />*/}
        </div>
        {
          <div className={styles.status}>
             {connected ? 'Online' : 'Offline'}(Mainnet)
            </div>
       }

        <div className={styles.progress_status}>{status}</div>

        <div className={styles.block}>
          <div className={styles.latest_height_label}>Latest Height</div>
          <div className={styles.latest_height}>{`${current_height}`}</div>
        </div>
      </div>
    );
  }

  renderMenu() {
    const pathname = this.props.location.pathname;
    return (
      <ul className={styles.menu}>
        <li className={pathname === '/home' && styles.selected}>

          <Link to="/home"><i className={styles.homeIcon}></i> Wallet</Link>
        </li>
        <li className={pathname === '/exchange' && styles.selected} >

          <Link to="/exchange"><i className={styles.exIcon}></i>Exchange</Link>
        </li>
      </ul>
    )
  }

  render() {

    const layout = hasLayout(this.props.location.pathname);
    const {block_height, status, current_height, peer_count} = this.props;
    if (!layout) {
      return this.props.children;
    }

    return (<div className={styles.container}>
      <div className={styles.left}>
        {this.renderTop()}
        {this.renderMenu()}

        <div className={styles.left_bottom}>
          <div className={styles.app_version}>Grin Purse V{version}</div>
          <div className={styles.copy_right}>
            Powered by <a href="javascript:;" onClick={() => {
              window.openUrl('https://bitmesh.com/?from=GrinPurse');
            }} >bitmesh.com</a>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.right_wrapper}>
          {this.props.children}
        </div>
      </div>
    </div>);
  }
}
