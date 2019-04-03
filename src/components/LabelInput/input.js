'use strict';
import React, {Component} from 'react';
import styles from './index.less';
import _ from 'i18n';
import { message, Icon } from 'antd';
import Input from 'components/input';
import userApi from 'apis/user';
import { encrypt } from 'utils';
import Countdown from 'react-countdown-now';
import fieldDecorator from 'components/login/fieldDecorator';
import checkToken from 'common/check_token';
import CountdownComponent from 'components/countdown';

@fieldDecorator
export default class LabelInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCountdown: false,
      isSending: false,
    };
  }

  verified(validate) {
    this.sendSMSCode(validate);
  }

  reset() {
    this.setState({
      showCountdown: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isReset) {
      this.setState({
        showCountdown: false
      });
    }
  }

  async sendSMSCode(validate) {
    if (this.state.isSending) return;
    try {
      const { code, params, api, getEmail } = this.props;

      const data = { code, params, validate };
      let isMail = false;
      if (api === 'email') {
        isMail = true;
        if (getEmail) {
          const email = getEmail();
          if (email === false) {
            return;
          }
          data.email = email;
          // dta.params = params;
        }
        data.type = 'mail';
      }
      this.setState({
        isSending: true
      })

      const token = encrypt(JSON.stringify(data), false);
      const res = await userApi.sendSMSCode(token);

      this.setState({
        isSending: false
      })

      if (!checkToken(res)) {
        return;
      }

      if (res === 506) {
        return this.setState({
          needVerify: true,
          showVerify: true
        });
      }

      if (this.props.onCountdownStart) {
        this.props.onCountdownStart();
      }

      this.setState({
        showCountdown: true,
      });

    } catch (err) {
      console.log(err);
    }
  }

  renderSendCountDown() {

    return <CountdownComponent leftTime={59 * 1000} 
      after="s"
      onEnd={() => {
        if (this.props.onCountdownFinish) {
          this.props.onCountdownFinish();
        }
        this.setState({ showCountdown: false });
      }} />

    // return (<Countdown
    //   date={Date.now() + this.props.countdown}
    //   onComplete={() => {
    //     if (this.props.onCountdownFinish) {
    //       this.props.onCountdownFinish();
    //     }
    //     this.setState({ showCountdown: false });
    //   }}
    //   renderer={this.countDownRenderer.bind(this)} />);
  }

  countDownRenderer({ hours, minutes, seconds, completed }) {
    if (completed) {
      this.setState({ showCountdown: false });
      return null;
    }
    return <span className={styles.countdown}>{seconds}s</span>;
  }

  getVerifyCode() {
    const { needVerify } = this.state;
    if (needVerify) {
      return this.setState({
        showVerify: true,
      });
    }
    this.sendSMSCode();
  }

  renderLabel() {
    const { countdown, label } = this.props;
    const { showCountdown } = this.state;
    if (showCountdown) {
      return this.renderSendCountDown();
    }

    if (countdown) {
      return <a href="javascript:;" className={styles.countdown_trigger} onClick={this.getVerifyCode.bind(this)}>
       {label}
       {this.state.isSending && <Icon type="loading" />}
      </a>;
    } else {
      return label;
    }
  }

  render() {
    const {countdown, label, onCountdownFinish, onCountdownStart, isReset,  ...rest} = this.props;

    return (<div className={styles['b-custom-input']}>
        <Input after={this.renderLabel()} length={6} {...rest}/>
        {this.renderModalVerify()}
      </div>)
  }
}
