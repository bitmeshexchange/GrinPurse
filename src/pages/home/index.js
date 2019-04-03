'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import Transactions from './transactions';
import Balance from './balance';
import {
  Icon
} from 'antd';
import styles from './index.less';

@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Home extends Component {
	
	componentDidMount() {
    this.props.dispatch({
      type: 'wallet/queryWallet',
    })
      .then(res => {
        this.setState({
          loading: false,
        })
        if (res && res.data) {
          const { exist, login } = res.data;
          if (!exist) {
            return this.goTo('/', false)
          }
          if (!login) {
            return this.goTo('login', false)
          }
          
        } 
      })
  }

  goTo = (page, isCheck = true) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.replace({
      pathname: page
    }));
  }


	render() {
		const { connected } = this.props;
    return (
      <div className={styles.container}>
      <div className={styles.top}> 
        <Balance />
      </div>
      <div className={styles.bottom}>
        <Transactions />
      </div>
	    	{ 
	        !connected && <div className="connecting">
	          <div>
	            <span className="loadingTxt">Connecting to the grin wallet... </span>
	            <span className="loadingIcon"></span>
	          </div>
	        </div>
	      }
    	</div>
    );
  }
}
