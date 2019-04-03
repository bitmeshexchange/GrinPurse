'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import QRCode from 'qrcode.react';
import CustomClipboard from 'components/clipboard';
import { connect } from 'dva';
import {
  Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete, message
} from 'antd';
// import { routerRedux } from 'dva/router';


const errorMsg = 'Please tick the Agreement';
@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Send extends Component {
  state ={
    checked: true,
    loading: true
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'wallet/queryWallet',
    })
      .then(res => {
        this.setState({
          loading: false,
        })
        if (res && res.data) {
          const { exist, login } = res.data;
          if (login) {
            return this.goTo('home', false)
          }
          if (exist) {
            return this.goTo('login', false)
          }
        } 
      })
  }

  goTo = (page, isCheck = true) => {
    const { dispatch } = this.props;
    if (!this.state.checked && isCheck) {
      return message.warn(errorMsg);
    }
    window.localStorage.removeItem('temp_restore_passphrase');
    if (page === 'restore') {
      window.localStorage.setItem('temp_restore_check', '1');
    }
    dispatch(routerRedux.push({
      pathname: page
    }));
  }

  openUrl(url) {
    const global = window.global;
    if (typeof global !== 'undefined') {
      global.electron.shell.openExternal(url);
    } else {
      window.location.href = url;
    }
  }

  render() {
    const { connected } = this.props;
    // console.log(connected)
    return (<div className={styles.container}>

        <div>
          <div className={styles.logo}></div>
        </div>
        <div className={styles.info}>Grin Purse presented by BitMesh</div>
        <div className={styles.handles}>
          <Button className={styles.new} onClick={this.goTo.bind(this, 'password')}>Get New Wallet</Button>
          <Button className={styles.restore} onClick={this.goTo.bind(this, 'restore')}>Restore Wallet</Button>
        </div>
        <div className={styles.agreement}>
            <Checkbox onChange={e => {
              this.setState({
                checked: e.target.checked
              })
            }} value={this.state.checked} checked={this.state.checked}>
              <span className={styles.agreementTxt}>
                I have read and accept the terms <a href="javascript:;" onClick={() => {
                  window.openUrl(`https://help.bitmesh.com/hc/en-us/articles/360020279573`)
                }}>Software Agreement</a>
              </span>
            </Checkbox>
        </div>
        { 
          !connected && <div className="connecting">
            <div>
              <span className="loadingTxt">Connecting to the grin wallet... </span>
              <span className="loadingIcon"></span>
            </div>
          </div>
        }
        
      </div>  
    );
  }
}
