'use strict';
import React, { Component } from 'react';
import { Spin, Icon } from 'antd';
import styles from './index.less';
import indicator from './indicator';

export default class PageLoading extends Component {
  render() {
    return (<div className={styles.loading_container}>
      <Spin size="large" indicator={indicator} />
    </div>);
  }
}
