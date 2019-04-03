'use strict';
import React, {Component} from 'react';
import { Link, routerRedux } from 'dva/router';
import { connect } from 'dva';
import LabelInput from 'components/input';
import styles from './index.less';

import {
  Spin, Modal,
  Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete,
} from 'antd';

let roll
const errorCode = {
  505: 'The http(s) address is not reachable',
  504: 'Receiver is probably offline right now, please try again later',
  402: 'The address format is incorrect',
  403: 'The address is not online',
  405: 'Invalid password',
  500: 'Please retry after block synchronization',
}
@connect(({ wallet, loading}) => {
  return {
    ...wallet,
  };
})
class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    sending: false,
  };

  componentDidMount() {
    this.setState({
      sending: false,
    })
  }
  componentWillUnmount () {
    this.clearRoll();
  }

  clearRoll() {
    if (roll) {
      clearInterval(roll);
      roll = null;
    }
  }

  error = (msg = 'An unknown error') => {
    Modal.error({
      title: 'Transaction failed, please try later',
      content: msg,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.clearRoll();

      // 如果sendingy一直不相应，30秒后返回
      roll = setTimeout(() => {
        this.props.dispatch(routerRedux.goBack());
      }, 30 * 1000);

      this.setState({
        sending: true,
      })

      this.props.dispatch({
        type: 'wallet/transfer',
        payload: {
          ...values,
        }
      }).then(res => {
        this.setState({
          sending: false,
        });
        this.clearRoll();
        const { success, data } = res;
        if (typeof data === 'number') {
          if (errorCode[data]) {
            return this.error(errorCode[data])
          }
          if (data === 401) {
            return this.props.dispatch(routerRedux.replace({
              pathname: 'login'
            }));
          }
          return this.error();
        }

        if (errorCode[data]) {
          return this.error(errorCode[data])
        }

        if (data === false) {
          return this.error();
        }

        if (data === 401) {
          return this.props.dispatch(routerRedux.replace({
            pathname: 'login'
          }));
        }

        Modal.success({
          title: 'Transaction created',
          content: 'Your transaction has been created successfully, please wait for the confirmation.',
          onOk: () => {
            this.props.dispatch(routerRedux.goBack());
          }
        });
      })
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const container = (
      <div className={styles.send_form_container}>
      <h2 className={styles.title}>Send</h2>
        <Form onSubmit={this.handleSubmit} layout="vertical" className={styles.send_form}>

          <Row type="flex" gutter={16} align="top" className={styles.transaction_item}>
            <Col span={16}>
              <Form.Item
                label="Send To"
              >
                {getFieldDecorator('address', {
                  rules: [{
                    required: true,
                    message: 'Address is required'
                  }]
                })(
                  <Input placeholder="Http(s) address or Grin-purse address"/>
                )}

              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Message(optional)"
              >
                {getFieldDecorator('memo')(
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>


          <Row type="flex" gutter={16} align="top" className={styles.transaction_item}>
            <Col span={16}>
              <Form.Item
                label="Amount"
              >
                {getFieldDecorator('amount', {
                  rules: [{
                    required: true,
                    message: 'Amount is required'
                  }, {
                    validator: (rule, value, callback) => {
                      if (+value > + this.props.spendable) {
                        return callback('Available ' + this.props.spendable)
                      }
                      callback();
                    }
                  }]
                })(
                  <LabelInput precision={8} after="GRIN" autoComplete="off" />
                )}
              </Form.Item>
              <div className={styles.spendable}>Available {this.props.spendable}</div>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Fee"
              >
                {getFieldDecorator('fee', {
                  initialValue: 'auto'
                })(
                  <LabelInput disabled={true} precision={8} ini after="GRIN" autoComplete="off" />
                )}
              </Form.Item>
            </Col>
          </Row>


          <Row type="flex" gutter={16} align="top" className={styles.transaction_item}>
            <Col span={16}>
              <Form.Item
                label="Password"
              >
                {getFieldDecorator('password', {
                  rules: [{
                    required: true,
                    message: 'Password is required'
                  }]
                })(
                  <Input type="password" autoComplete="off" />
                )}
              </Form.Item>
            </Col>
          </Row>


          <Form.Item>
            <div className={styles.buttons}>
              <a href="javascript:;" className={styles.send} onClick={::this.handleSubmit}>send</a>
              <Link to="/home">Back</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    );

    return this.state.sending ? <Spin tip="Sending...">{container}</Spin> : container;
  }
}

const WrappedRegistrationForm = Form.create({ name: 'send' })(RegistrationForm);

export default class Send extends Component {
  render() {
    return (<div className={styles.container}>
          <WrappedRegistrationForm />
          <div className={styles.notice}>
            <h2>Notice</h2>
            <div>
              <p>Grin purse supports the Grin wallet addresses with http(s) and Grin Purse format</p>
              <p>For example</p>
              <p>1. IP+port format,  e.g.  http://xxx.xxx.xxx.xxx:3415</p>
              <p>2. Https format, e.g.  https://grin.bitmesh.com/3pTwHQUJSibYm9GXjnrcFE7436</p>
              <p>3. Grin purse format, e.g.  GP2dsUM1fnYNvfKbicp96XRSxonvzRy5wXz8sj5J</p>
            </div>
          </div>
      </div>);
  }
}
