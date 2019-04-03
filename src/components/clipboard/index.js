'use strict';
import React, {Component} from 'react';
import Clipboard from 'react-clipboard.js';
import {message, Icon} from 'antd';
import styles from './index.less';

export default class CustomClipboard extends Component {

  onCopySuccess() {
    message.success('Copied');
  }

  render() {
    let label = this.props.label ? this.props.label : <Icon type="copy" />
    return (<Clipboard component="span"
      onSuccess={::this.onCopySuccess}
      data-clipboard-text={this.props.text}
      className={styles.clipboard}>
      {label}
    </Clipboard>);
  }
}
