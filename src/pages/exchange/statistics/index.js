'use strict'
import React, {Component} from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'dva';
import logo from 'src/assets/wallet/logo.png';
import recvIcon from 'src/assets/wallet/receiving.png';
import sendIcon from 'src/assets/wallet/sending.png';
import { Link } from 'dva/router';
import Receive from '../../receive';
import styles from './index.less';
import { keepDecimal } from 'src/common/utils';


@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Balance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  } 

  render() {
    let { statistics } = this.props.exchange;
    if (!statistics) {
      statistics = {}
    }
    // if (!statistics) return <></>;
    const isGrow = statistics.change && statistics.change.indexOf('-') === -1 ;

    // style={{ color: statistics.change.indexOf('-') === -1 ? '#1dba75' : '#f7521d' }}
    return (<div className={styles.balance}>
      <div className={styles.price_left}>
        <div>
          <div className={styles.currentPrice}>
            <div>{statistics.price}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.32)', fontSize: 12, marginLeft: 5 }}>BTC</div>
          </div>
          {/* <div className={styles.about}>≈${3.23}</div>  */}
        </div>
        <div className={styles.change} style={{ color: isGrow ? '#1dba75' : '#f7521d' }}>{isGrow ? '+' : ''} {statistics.change}%</div>
      </div>

      <div className={styles.balance_right}>
        <div>
          <div className={styles.value}>{statistics.max}</div>
          <div className={styles.key}>24h High</div>
        </div>
        <div>
          <div className={styles.value}>{statistics.min}</div>
          <div className={styles.key}>24h Low</div>
        </div>
         <div>
           <div className={styles.value}>{statistics.volume  ? (+statistics.volume).toFixed(4) : '-'}</div>
           <div className={styles.key}>24h V(GRIN)</div>
         </div> 
        {/*<div> 
          <div className={styles.value}>{statistics.value ? (+statistics.value).toFixed(4) : '-'}</div>
          <div className={styles.key}>24h V(BTC)</div>
        </div>*/}

        <div>
          <Button className={styles.exchange} onClick={() => {
            window.openUrl(`https://bitmesh.com/exchange?market=btc_grin&from=GrinPurse#/`)
          }}>Trade</Button>
        </div>
      </div>
    </div>);
  }
}
