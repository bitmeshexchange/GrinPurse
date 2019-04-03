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
import Clipboard from 'components/clipboard';

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Send extends Component {
  state ={
    passphrase: '',
    missPassword: false,
  }

  componentDidMount() {
    let password;
    try {
      const temp_pwd = window.localStorage.getItem('temp_pwd');
      password = temp_pwd ? window.atob(temp_pwd) : ''
    } catch(err) {}
    if (!password) {
      this.setState({
        missPassword: true
      });
      return message.error('Password is missing');
    }
    this.props.dispatch({
      type: 'wallet/createMnemonic',
      payload: {
        password,
      }
    })
    .then(res => {
      if (res.success && typeof res.data === 'string') {
        this.setState({
          passphrase: res.data,
        })
      }
    })
  }

  goBack = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.goBack());
  }

  goConfirm = () => {
    const { dispatch } = this.props;
    const { passphrase } = this.state;
    if (!passphrase) {
      return message.warn('Please waiting for the passphrase generating');
    }
    // 临时存在localStorage，下一个页面刷新，数据还在
    // 生成完成之后再清除
    window.localStorage.setItem('temp_passphrase', window.btoa(this.state.passphrase));
    dispatch(routerRedux.push({
      pathname: 'confirm',
    }));
  }

  render() {
    // const {address} = this.props;
    const { passphrase, missPassword } = this.state;
    const passphraseList = passphrase.split(' ');
    // passphraseList.length = 12;

    const groupSize = Math.ceil(passphraseList.length / 6);

    return (
      <div className={styles.container}>
        <div className={styles.title}>Create New Wallet</div>
        <div className={styles.remind}>
          Your seed phrase is the access key to all the cryptocurrencies in your wallet. 
        </div>
        {missPassword ? <div className={styles.missPassword}>Password is missing , place go back</div> : (passphrase ? <ul className={styles.wordsList}>
          
          <li>
            {
              passphraseList
                .filter((item, key) => key <= 5)
                .map((item, key) => <span key={key}>&nbsp;{item}&nbsp;</span>)
            }
          </li>
          <li>
            {
              passphraseList
                .filter((item, key) => key >= 6)
                .map((item, key) => <span key={key}>&nbsp;{item}&nbsp;</span>)
            }
          </li>
          
        </ul> : <div className={styles.loading}>
          <Icon style={{fontSize: 30, color: '#00B5FF'}} type="loading" />
        </div>)}

        <div className={styles.useage}>
          Please keep your passphrase in a safe place, losing passphrase will cause losing of all your asset stored in this wallet.
          { passphrase ? <Clipboard text={passphrase} label={<span className={ styles.copy }>
            <Icon type="copy" /> 
            <em>copy</em>
          </span>} /> : <span className={ styles.copyDisabled }>
            <Icon type="copy" /> 
            <em>copy</em>
          </span>}
        </div>
        <div className={styles.handles}>
          <span className={styles.back} onClick={this.goBack}>Back</span>
          <span className={styles.next} onClick={this.goConfirm}>Next</span>
        </div>
      </div>  
    );
  }
}

