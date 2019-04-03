'use strict';
import {withRouter, routerRedux} from 'dva/router';
import React, {Component} from 'react';
import qs from 'querystringify';

let store, routes = {};

export function registerStore(_store) {
  store = _store;
}

export function registerRouter(list) {
  list.map(item => {
    routes[item.name] = item;
  });
}

export default (WrapComponent) => {
  class NewComponent extends Component {
    render() {
      const dispatch = store.dispatch;
      const {location} = this.props;
      const params = location.search ? qs.parse(decodeURIComponent(location.search.substring(1))) : {};
      const navigation = {
        goBack: () => {
          dispatch(routerRedux.goBack());
        },
        getParam: (key, defaultParams) => {
          return params[key] || defaultParams;
        },
        navigate: (pageName, params) => {
          const item = routes[pageName];

          let pathname = item.path;
          if (params) {
            pathname = pathname + '?' + qs.stringify(params);
          }

          dispatch(routerRedux.push({
            pathname,
          }));
        }
      }
      return <WrapComponent {...this.props} navigation={navigation} />
    }
  }
  return withRouter(NewComponent);
}
