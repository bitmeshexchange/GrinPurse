'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import CustomClipboard from 'components/clipboard';
import { connect } from 'dva';
import {
  Input, message
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
  }

  componentDidMount() {
    // 返回保留数据
    try {
      const temp_restore_passphrase = localStorage.getItem('temp_restore_passphrase') ;
      if (temp_restore_passphrase) {
        this.setState({
          value: window.atob(temp_restore_passphrase)
        })
      }
    } catch(err) {}
  }

  goBack = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.goBack());
  }

  onConfirm = () => {
    const { dispatch } = this.props;
    const { value, passphrase } = this.state;
    const formatVal = value.trim().split(/\s+|\n+/g);
    // if (formatVal.length !== 12) {
    //   return message.error('The passphrase format is incorrect');
    // }
    localStorage.setItem('temp_restore_passphrase', window.btoa(formatVal.join(' ')));

    dispatch(routerRedux.replace({
      pathname: 'password',
      query: {
        isRestore: true
      }
    }));
  }

  render() {
    return (
    	<div className={styles.container}>
        <div className={styles.title}>Restore Wallet</div>
        <div className={styles.remind}>
          Pleasure enter your seed phrase correctly.
        </div>
        <div>
          <Input.TextArea value={ this.state.value } onChange={e => {
            this.setState({
              value: e.target.value
            })
          }} className={styles.textarea} placeholder="Please input the seed phrase" />
        </div>
        <div className={styles.handles}>
          <span className={styles.back} onClick={this.goBack}>Back</span>
          <span className={styles.next} onClick={this.onConfirm}>Next</span>
        </div>
      </div>
    );
  }
}
