'use strict';
import React, {Component} from 'react';
import { Link } from 'dva/router';
import styles from './index.less';
import QRCode from 'qrcode.react';
import CustomClipboard from 'components/clipboard';
import { connect } from 'dva';

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Send extends Component {

  componentDidMount() {
    // fetchAddress
    this.props.dispatch({
      type: 'wallet/fetchAddress'
    });
  }

  render() {
    const {address} = this.props;
    return (<div className={styles.container}>
        <div className={styles.address_info}>
          <div className={styles.qrcode}>
              <QRCode value={address} />
          </div>
          <div className={styles.address}>
            <div className={styles.content}>{address}</div>
            <div className={styles.buttons}>
              <CustomClipboard label={<a href="javascript:;">Copy</a>} text={address} />
            </div>
          </div>
        </div>
        <div className={styles.warning}>Please keep your wallet online while receiving!</div>
    </div>);
  }
}
