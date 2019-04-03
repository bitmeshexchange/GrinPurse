'use strict'
import React, {Component} from 'react';
import {Modal, Spin, Icon} from 'antd';
import { connect } from 'dva';
import logo from 'src/assets/wallet/logo.png';
import recvIcon from 'src/assets/wallet/receiving.png';
import sendIcon from 'src/assets/wallet/sending.png';
import { Link } from 'dva/router';
import Receive from '../../receive';
import styles from './index.less';

const confirm = Modal.confirm;
const antIcon = <Icon type="loading" style={{ fontSize: 24, marginLeft: 10 }} spin />;

@connect(({ wallet, loading}) => {
  return {
    ...wallet,
    checking: loading.effects['wallet/check'],
  };
})
export default class Balance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'wallet/fetchAddress',
    });
    this.props.dispatch({
      type: 'wallet/fetchBalance',
    });

    if (window.localStorage.getItem('temp_restore_check')) {
      this.check();
      window.localStorage.removeItem('temp_restore_check');
    }
  }

  check() {
    this.props.dispatch({
      type: 'wallet/check',
    }).then(() => {
      this.props.dispatch({
        type: 'wallet/fetchTransactions',
      });
      this.props.dispatch({
        type: 'wallet/fetchBalance',
      });

    });
  }

  runCheck() {
    confirm({
      title: 'Do you Want to continue?',
      content: 'Run check may cause all the pending transactions to be canceld.',
      onOk: () =>{
        this.check();
      },
    }); 
  }
  // 
  render() {
    const {spendable, total, receiving, sending, checking} = this.props;
    return (<div className={styles.balance}>
      <div className={styles.balance_left}>
        <div className={styles.amount}>{`${spendable}/${total}`}</div>
        <div className={styles.type}>Spendable/Total</div>
        <div className={styles.refresh_balance}>
          <a href="javaScript:;" onClick={::this.runCheck}>check</a>
        </div>
      </div>

      <div className={styles.balance_right}>
        <div className={styles.receiving}>
          <div className={styles.icon}>
            <img src={recvIcon} />
          </div>
          <div className={styles.amount}>+{receiving}</div>
          <div className={styles.type}>Receiving</div>
        </div>
        <div className={styles.sending}>
          <div className={styles.icon}>
            <img src={sendIcon} />
          </div>
          <div className={styles.amount}>{sending}</div>
          <div className={styles.type}>Sending</div>
        </div>

        <Modal
          title="Receive"
          visible={this.state.visible}
          footer={null}
          onCancel={() => {
            this.setState({
              visible: false,
            });
          }}
        >
          <Receive />
        </Modal>

        <Modal
          title="Checking"
          visible={checking}
          footer={false}
          closable={false}
          centered={true}
        >
          Checking your balance, this may take a while, please wait <Spin indicator={antIcon} />
        </Modal>

        <div className={styles.action}>
          <div><Link to="/send" className={styles.action_button}>Send</Link></div>
          <div><a href="javascript:void(0);" onClick={() => {
            this.setState({
              visible: true,
            });
          }} className={[styles.action_button, styles.recv].join(' ')}>Receive</a></div>
        </div>
      </div>
    </div>);
  }
}
