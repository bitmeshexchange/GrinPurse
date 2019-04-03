import React from 'react';
import { Router, Route, Switch, IndexRoute, routerRedux } from 'dva/router';
import {getRouterData} from './routers/';
import AppLayout from './pages/layout';

import {registerStore, registerRouter} from 'mixins/withRouter';

const {pathname} = window.location;

function RouterConfig({ history, app }) {
  const routerConfig = getRouterData(app);
  const routes = [];

  routerConfig.map(item => {
    routes.push(<Route path={item.path} key={item.path} exact={item.exact !== false} component={item.component} />);
  });

  registerStore(app._store);
  registerRouter(routerConfig);

  return (
    <Router history={history}>
      <Switch>
        <AppLayout>
          {routes}
        </AppLayout>
      </Switch>
    </Router>
  );
}

export default RouterConfig;
