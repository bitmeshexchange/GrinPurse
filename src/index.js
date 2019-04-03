'use strict';
import router from './router';
import './common/public_path';
import './index.less';
import app from './app';
import { Spin } from 'antd';
import indicator from 'components/loading/indicator';
import { getParameterFromUrl } from 'utils';
import walletModel from './models/wallet';

Spin.setDefaultIndicator(indicator)

app.model(walletModel);
app.router(router);
app.start('#root');
