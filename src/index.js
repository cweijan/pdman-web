import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Loading from './app/Loading';


import 'antd/dist/antd.css';

/**
 * antd参考文档: https://ant.design/components/overview-cn/
 */

ReactDOM.render(
    <Loading />,
  document.getElementById('root')
);

// serviceWorker.register()
serviceWorker.unregister();
