'use strict';
import dva from 'dva';
import createLoading from 'dva-loading';

const app = dva();

app.use(createLoading());

export default app;
