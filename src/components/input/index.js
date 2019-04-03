'use strict';
import {Component} from 'react';
import { Input } from 'antd';
import {parseNumberWithPrecision} from 'utils';
import styles from './index.less';

export default class LabelInput extends Component {
  componentDidMount() {
    const before = this.refs.before;
    if (before && this.props.before) {
      const width = before.offsetWidth;
      const input = this.refs.input.input;
      input.style.paddingLeft = width + 'px';
    }
  }

  // '1.' '1x' 'xx' '' => are not complete numbers
  isNotCompleteNumber(num) {
    if (isNaN(num) || num === '' || num === null) {
      return true;
    }

    const str = num && num.toString() || '';
    const index = str.indexOf('.');
    return index === str.length - 1 || index === -1;
  }

  toNumber(num) {
    if (this.isNotCompleteNumber(num)) {
      return num;
    }
    if ('precision' in this.props) {
      return parseNumberWithPrecision(num, this.props.precision);
    }
    return Number(num);
  }

  // '1.0' '1.00'  => may be a inputing number
  toNumberWhenUserInput(num) {
    // num.length > 16 => prevent input large number will became Infinity
    num = num.replace(/[^\d.]/g, '')
      .replace(/^([^.]*\.)(.*)$/, function($0, $1, $2) {
        return $1 + $2.replace(/[^\d]/g, '');
      });
    if (/\.\d*0$/.test(num) || num.length > 16) {
      return num;
    }
    if (num.startsWith('.')) return '0' + num;
    return this.toNumber(num);
  }

  getValueFromEvent(e) {
    // optimize for chinese input expierence 
    // https://github.com/ant-design/ant-design/issues/8196
    let value = e.target.value.trim().replace(/。/g, '.');

    if ('decimalSeparator' in this.props) {
      value = value.replace(this.props.decimalSeparator, '.');
    }

    if ('length' in this.props) {
      value = value.slice(0, this.props.length);
    }

    return value;
  }

  getValidValue(value, min = this.props.min, max = this.props.max) {
    let val = parseFloat(value, 10);
    // https://github.com/ant-design/ant-design/issues/7358
    if (isNaN(val)) {
      return value;
    }
    if (val < min) {
      val = min;
    }
    if (val > max) {
      val = max;
    }
    return val;
  }

  onChange(e) {
    const value = this.toNumberWhenUserInput(this.getValueFromEvent(e));
    e.target.value = value;

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    const {before, after, inline, ...rest} = this.props;
    const cls = [styles.container];
    if (inline) {
      cls.push(styles.inline);
    }
    return <div className={cls.join(' ')}>
      <div className={styles.before} ref="before">{before}</div>
      <div className={styles.input}><Input ref="input" {...rest} onChange={::this.onChange} /></div>
      <div className={styles.after}>{after}</div>
    </div>
  }
}
