'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import QRCode from 'qrcode.react';
import CustomClipboard from 'components/clipboard';
import { connect } from 'dva';
import {
  Form, Input, Button, message
} from 'antd';
import LabelInput from 'components/input';
const FormItem = Form.Item;

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
@Form.create()
export default class Send extends Component {
  constructor(props) {
    super(props);
    const isRestore = props.location.query && props.location.query.isRestore

    this.state = {
      visible: false,
      loading: false,
      temp_restore_passphrase: '',
    };
  }

  componentDidMount() {
    // 返回保留数据
    try {
      const temp_restore_passphrase = localStorage.getItem('temp_restore_passphrase') ;
      if (temp_restore_passphrase) {
        this.setState({
          temp_restore_passphrase: window.atob(temp_restore_passphrase)
        })
      }
    } catch(err) {}
  }

  goBack = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.goBack());
  }
  onSubmit = () => {
    const { dispatch, form } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {

        if (this.state.temp_restore_passphrase) {
          this.setState({
            loading: true,
          })
          return dispatch({
            type: 'wallet/importWallet',
            payload: {
              password: values.password,
              mnemonic: this.state.temp_restore_passphrase,
            }
          })
            .then(res => {
              this.setState({
                loading: false,
              })
              if (res.data === '' || res.data === true || res.data === 'success') {
                localStorage.removeItem('temp_restore_passphrase');
                return dispatch(routerRedux.replace({
                  pathname: 'sync',
                }));
              } else {
                return message.error('Invalid password or passphrase')
              }
            })

        }
        // 临时存在localStorage，下一个页面刷新，数据还在
        // 生成完成之后再清除
        window.localStorage.setItem('temp_pwd', window.btoa(values.password));
        dispatch(routerRedux.push({
          pathname: 'passphrase',
        }));
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldError, getFieldValue } = this.props.form;
    const {address} = this.props;
    return (<div className={styles.container}>

        <div className={styles.main}>
          <div className={styles.title}>Set Password</div>
          <div className={styles.remind}>
            Enter your password to access your wallet
          </div>

          <div className={styles.form}>
          <FormItem
            label="Enter Password"
          >
            {getFieldDecorator('password', {
              // initialValue,
              rules: [{
                required: true,
                message: 'Password is required'
              }]
            })(
              <Input maxlength="200" type="password" placeholder="Please enter password" autocomplete="off" />
            )}
          </FormItem>

          <FormItem
            label="Confirm Password"
          >
            {getFieldDecorator('confirm_password', {
              // initialValue,
              rules: [{
                required: true,
                message: 'Confirm password is required'
              }, {
                validator: (rule, value, callback) => {
                  const form = this.props.form;
                  if (value && value !== form.getFieldValue('password')) {
                    callback('Two passwords that you enter is inconsistent!');
                  } else {
                    callback();
                  }
                }
              }]
            })(
              <Input maxlength="200" type="password" placeholder="Please enter password" autocomplete="off" />
            )}
          </FormItem>
          </div>
          <div className={styles.handles}>
            <span className={styles.back} onClick={this.goBack}>Back</span>
            <Button loading={this.state.loading} className={styles.next} onClick={this.onSubmit}>Next</Button>
          </div>
        </div>
      </div>
    );
  }
}
