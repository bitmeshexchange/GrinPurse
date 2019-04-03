import React, {Component} from 'react';
import { Tabs } from 'antd';
import { List, Collapse, Modal, message } from 'antd';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './index.less';
import moment from 'moment';
import CustomClipboard from 'components/clipboard';
import { StickyContainer, Sticky } from 'react-sticky';
const BN = require('bignumber.js');
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const scale = 1e9;

let roll
@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Transactions extends Component {

  componentDidMount() {
    this.fetch();
    roll = setInterval(this.fetch.bind(this), 30 * 1000);
  }

  componentWillUnmount () {
    clearInterval(roll);
    roll = null;
  }

  fetch() {
    this.props.dispatch({
      type: 'wallet/fetchTransactions',
    });
  }

  renderHeader() {
    return (<Row type="flex" align="top" className={styles.header}>
      <Col span={5}>Creation Time</Col>
      <Col span={12}>Transaction ID</Col>
      <Col span={4}>Amount</Col>
      <Col span={3}>Status</Col>
      {/*  Col span={3}>Action</Col> */}
    </Row>);
  }

  renderTransaction(tx) {
    const {messages, amount_credited, amount_debited, creation_ts, confirmation_ts, tx_slate_id, id, address, tx_type} = tx;
    let amount = amount_credited - amount_debited;
    amount = BN(amount).div(scale).toString();
    const fee = BN(tx.fee || 0).div(scale).toString();
    const creationts = moment(creation_ts).format('YYYY-MM-DD HH:mm:ss');
    const confirmationts = confirmation_ts ? moment(confirmation_ts).format('YYYY-MM-DD HH:mm:ss') : '';
    const msg = messages && messages.messages.filter(item => item.message)[0];
    const memo = msg ? msg.message : '';
    // console.log(message, message || message.message,  memo)

    const isSend = tx_type.indexOf('Receive') > -1;

    const { dispatch } = this.props;
    const isPending = !tx.confirmed && tx.tx_type.indexOf('Cancelled') === -1;

    return (<Panel showArrow={false} header={<Row type="flex" gutter={4} align="top" className={styles.transaction_item}>
      <Col span={5}>{creationts.split(' ').map(item => <div>{item}</div>)}</Col>
      <Col span={12}>{tx_slate_id || 'Checked from blockchain'}</Col>
      <Col span={4}>{amount > 0 ? '+' + amount : amount}</Col>
      <Col span={3}>{tx.tx_type.indexOf('Cancelled') > -1 ? 'Cancelled' : tx.confirmed ? 'Confirmed' : 'Confirming'}</Col>

    </Row>}
     key={tx.id}>
     <div className={styles.detail}>
       {address && <div className={styles.detail_item}>
          <div className={styles.label}>{isSend ? `Sender Address` : `Receiver Address` }</div>
          <div className={styles.value}>
            <CustomClipboard label={address} text={address}/>
          </div>
       </div>}
       <div className={styles.detail_item}>
          <div className={styles.label}>Transaction ID: </div>
          <div className={styles.value}>
            { tx_slate_id ? <CustomClipboard label={tx_slate_id} text={tx_slate_id}/> : 'Checked from blockchain'}
          </div>
       </div>

       {/*<div className={styles.detail_item}>
          <div className={styles.label}>Amount: </div>
          <div className={styles.value}>{amount > 0 ? '+' + amount : amount}</div>
       </div>*/}



       {fee !== '0' && <div className={styles.detail_item}>
          <div className={styles.label}>Fee: </div>
          <div className={styles.value}>{fee}</div>
       </div>}

       {memo && <div className={styles.detail_item}>
          <div className={styles.label}>Message: </div>
          <div className={styles.value}>{memo}</div>
       </div>}



       {/*<div className={styles.detail_item}>
          <div className={styles.label}>Creation Time: </div>
          <div className={styles.value}>{creationts}</div>
       </div>*/}

        <div className={styles.detail_item}>
          <div className={styles.label}>Confirmation Time: </div>
          <div className={styles.value}>{confirmationts || '-'}</div>
       </div>
     </div>
    </Panel>);
  }

  renderTabBar(props, DefaultTabBar) {
    return (<Sticky>
      {({ style }) => {
        return <div style={{ ...style, zIndex: 10 }}><DefaultTabBar {...props} /></div>
      }}
    </Sticky>);
  }


  renderTable(list) {
    return (
      <>
        {this.renderHeader()}
        {
          !!list.length ? <Collapse>
            {list.map(tx => this.renderTransaction(tx))}
          </Collapse> :
          <div className={styles.noRecords}>No Records</div>
        }
      </>);
  }

  render() {
    const {transactions = [] } = this.props;

    const sendList = transactions.filter(tx => tx.tx_type.indexOf('Sen') > -1);
    const receiveList = transactions.filter(tx => tx.tx_type.indexOf('Receive') > -1);

    return <div className={styles.transactions}>
    <StickyContainer>
      <Tabs className={styles.container} renderTabBar={this.renderTabBar}>
        <TabPane tab="All" key="1">
          {this.renderTable(transactions)}
        </TabPane>
        <TabPane tab="Sent" key="2">
          {this.renderTable(sendList)}
        </TabPane>
        <TabPane tab="Received" key="3">
          {this.renderTable(receiveList)}
        </TabPane>
      </Tabs>
    </StickyContainer>
    </div>
  }
}
