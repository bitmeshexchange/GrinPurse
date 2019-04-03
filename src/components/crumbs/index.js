'use strict';
import React, { Component } from 'react';
import { Breadcrumb } from 'antd'
import styles from './index.less'
import _ from 'i18n';


export default class Btn extends Component {
  constructor(props) {
    super(props);
  }

  // 
  render() {
    const { crumb } = this.props;
    let renderCrumb = [{
      name: _('userCenter'),
      link: 'user',
    }];
    if (Object.prototype.toString.call(crumb) === '[object Array]') {
      renderCrumb = crumb
    } else {
      renderCrumb.push({
        name: crumb
      });
    }

    return crumb ?
      <div className={styles.container}>
        <Breadcrumb className={styles.crumb}>
          {
            renderCrumb.map((item, index) => {
              return (<Breadcrumb.Item key={index}>
                {
                  item.link ? <a className="tc" href={'#/' + item.link}>{item.name}</a> : <span className="mc">{item.name}</span>
                }
              </Breadcrumb.Item>)
            })
          }
        </Breadcrumb>
      </div> : <></>
  }
}


