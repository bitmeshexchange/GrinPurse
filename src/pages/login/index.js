'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import { connect } from 'dva';
import {
  Form, Input, Button, message
} from 'antd';

const FormItem = Form.Item;

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
@Form.create()
export default class Send extends Component {
  state ={
    password: '',
    loading: false,
  }

  onLogin = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          loading: true
        })
        this.props.dispatch({
          type: 'wallet/login',
          payload: {
            password: this.state.password
          }
        })
          .then(res => {
            this.setState({
              loading: false
            })
            if (res && res.data) {
              this.props.dispatch(routerRedux.push({
                pathname: 'home'
              }));
            } else {
              message.error('Invalid password')
            }
          })
          .catch(err => {
            this.setState({
              loading: false
            })
          })
      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldError, getFieldValue } = this.props.form;
    return (<div className={styles.container}>
        <div>
          <div className={styles.logo}></div>
        </div>
        <div className={styles.info}>Grin Purse presented by BitMesh.com</div>

        <div className={styles.pwdContent}>
        <FormItem
            label=""
            style={{textAlign: 'left'}}
          >
            {getFieldDecorator('confirm_password', {
              // initialValue,
              rules: [{
                required: true,
                message: 'Password is required'
              }]
            })(
              <Input type="password"
                onKeyPress={e => {
                  if (e.charCode === 13 || e.keyCode === 13) {
                    this.onLogin();
                  }
                }}
              onChange={e => {
                this.setState({
                  password: e.target.value
                })
              }} placeholder="Please enter your password" />
            )}
          </FormItem>


        </div>

        <div className={styles.handles}>
          <Button loading={this.state.loading} onClick={this.onLogin} className={styles.login}>Enter My Wallet</Button>
        </div>
      </div>
    );
  }
}
