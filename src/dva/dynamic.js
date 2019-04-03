import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import Loading from 'components/loading';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

export default function dynamicWrapper(app, models, component, {mixin, children}) {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  mixin = mixin || function(Component) {
    return Component;
  }

  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    LoadingComponent: Loading,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then(raw => {
        const Component = mixin(raw.default || raw);
        return props => {
          const p = {
            ...props,
            routerData: routerDataCache,
          };
          if (children && children.length) {
            p.children = children;
          }
          return createElement(Component, p);
        }
      });
    },
  });
};
