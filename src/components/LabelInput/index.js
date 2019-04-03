'use strict';
import React from 'react';
import styles from './index.less';
import _ from 'i18n';
import {
  Input
} from 'antd';
import { Link } from 'dva/router';

const InputGroup = Input.Group;

export default class LabelInput extends React.Component {
  renderLabel() {
    if (this.props.showLable) {
      return (<label
        className={styles['label-input']}>
        <Link
          to={this.props.link}
          className={styles['label-input']}>
          {this.props.label}
        </Link>
      </label>);
    }
  }
  renderInput(getFieldDecorator) {
    return(
      <div>
        <InputGroup compact>
          {this.renderLabel()}
          {getFieldDecorator(this.props.name, {
              rules: [{
                required: true, message: this.props.message,
              }],
            })(
            <Input
              placeholder={this.props.placeholder}
              className={styles['custom-input']}
              style={this.props.style}
              disabled={this.props.disabled}
              id={this.props.name}
              name={this.props.name}
              type={this.props.type}
              size='large' />
          )}
        </InputGroup>
      </div>
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        { this.renderInput(getFieldDecorator) }
      </div>
    )
  }
}
