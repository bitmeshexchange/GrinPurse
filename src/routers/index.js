'use strict';
import dynamicWrapper from '../dva/dynamic';
import routes from './map';
import { Router, Route, Switch, IndexRoute, routerRedux } from 'dva/router';

function parseRoute(app, item) {
  let {children, login, path} = item;
  if (children && children.length) {
    children = children.map(i => {
      const r = parseRoute(app, i);
      return <Route path={path + r.path} key={r.path} exact={r.exact !== false} component={r.component} />
    });
  }

  return {
    ...item,
    component: dynamicWrapper(app, item.models || [], item.component, {
      children,
    }),
  }
}

export const getRouterData = app => {
  return routes.map(item => {
    return parseRoute(app, item);
  });
};
