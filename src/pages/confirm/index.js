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

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Send extends Component {
  state ={
    checked: false,
    value: '',
    passphrase: '',
    password: '',
  }

  componentDidMount() {
    let passphrase, password
    try {
      const temp_passphrase = window.localStorage.getItem('temp_passphrase');
      passphrase = temp_passphrase ? window.atob(temp_passphrase) : ''
      const temp_pwd = window.localStorage.getItem('temp_pwd');
      password = temp_pwd ? window.atob(temp_pwd) : ''
    } catch(err) {}
    if (!passphrase) {
      return message.error('Passphrase is missing');
    }
    this.setState({
      passphrase,
      password
    });
  }

  goBack = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.goBack());
  }

  onConfirm = () => {
    const { dispatch } = this.props;
    const { value, passphrase, password } = this.state;
    const formatVal = value.trim().split(/\s+|\n+/g);
    // if (formatVal.length !== 12) {
    //   return message.error('The passphrase format is incorrect');
    // }
    // debugger;
    if (formatVal.join(' ') === passphrase) {
      return dispatch({
        type: 'wallet/importWallet',
        payload: {
          password,
          mnemonic: passphrase
        }
      })
        .then(res => {
          if (res.data === '' || res.data === true || res.data === 'success') {
            localStorage.removeItem('temp_passphrase');
            localStorage.removeItem('temp_password');
            return dispatch(routerRedux.replace({
              pathname: 'sync',
            }));
          } else {
            return message.error('Invalid password or passphrase')
          }
        })

      dispatch(routerRedux.replace({
        pathname: 'sync',
      }));
    } else {
      message.error('The passphrase is incorrect');
    }
  }

  render() {
    const {address} = this.props;
    return (<div className={styles.container}>

        <div className={styles.title}>Create New Wallet</div>
        <div className={styles.remind}>
          Your seed phrase is the access key to all the cryptocurrencies in your wallet.
        </div>
        <div className={styles.textareaContent}>
          <Input.TextArea onChange={e => {
            this.setState({
              value: e.target.value
            })
          }} className={styles.textarea} placeholder="Please repeat the seed phrase" />
        </div>
        <div className={styles.handles}>
          <span className={styles.back} onClick={this.goBack}>Back</span>
          <span className={styles.next} onClick={this.onConfirm}>Next</span>
        </div>
      </div>
    );
  }
}
