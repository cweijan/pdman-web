import 'antd/dist/antd.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './app/Home';
import './assert/antd/iconfont.css';
import './index.css';
import * as serviceWorker from './serviceWorker';


/**
 * antd参考文档: https://ant.design/components/overview-cn/
 */

const columnOrder=[
  { code: 'chnname', value: '字段名', com: 'Input', relationNoShow: false },
  { code: 'name', value: '逻辑名', com: 'Input', relationNoShow: false },
  { code: 'type', value: '类型', com: 'Select', relationNoShow: false },
  { code: 'dataType', value: '数据库类型', com: 'Text', relationNoShow: true },
  { code: 'defaultValue', value: '默认值', com: 'Input', relationNoShow: true },
  { code: 'pk', value: '主键', com: 'Checkbox', relationNoShow: false },
  { code: 'notNull', value: '非空', com: 'Checkbox', relationNoShow: true },
  { code: 'autoIncrement', value: '自增', com: 'Checkbox', relationNoShow: true },
  { code: 'remark', value: '说明', com: 'Input', relationNoShow: true },
  { code: 'relationNoShow', value: '关系图', com: 'Icon', relationNoShow: true },
  { code: 'uiHint', value: 'UI建议', com: 'Select', relationNoShow: true },
];


ReactDOM.render(
  <Home columnOrder={columnOrder} />,
  document.getElementById('root')
);

// serviceWorker.register()
serviceWorker.unregister();
