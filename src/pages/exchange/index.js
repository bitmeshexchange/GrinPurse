'use strict';
import React, {Component} from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import Transactions from './transactions';
import Statistics from './statistics';
import {
  Icon
} from 'antd';
import styles from './index.less';


let roll
@connect(({ wallet}) => {
  return {
    ...wallet
  };
})
export default class Home extends Component {
	
	componentDidMount() {
    this.fetchExchange();
    if (roll) clearInterval(roll);
    roll = setInterval(this.fetchExchange, 60 * 1000);
  }
  
  fetchExchange = () => {
    this.props.dispatch({
      type: 'wallet/fetchExchange',
    })
  }

  componentWillUnmount () {
    clearInterval(roll);
    roll = null;
  }

	render() {
		const { connected } = this.props;
    const { statistics } = this.props.exchange;
    // if (!statistics) return <></>; 
    return (
    	<div>
	    	<Statistics />
	      <Transactions />
	    	{
	        !statistics && <div className={styles.connecting}>
	          <div>
	            <span className="loadingTxt">Connecting to the BitMesh Exchange api server... </span>
	            <span className="loadingIcon"></span>
	          </div>
	        </div>
	      }
    	</div>
    );
  }
}
