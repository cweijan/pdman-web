import history from '@/service/history';
import React from 'react';
import Home from './Home';
import './style/loading.less';

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.split = process.platform === 'win32' ? '\\' : '/';
    this.state = {
      width: '100%',
      histories: history.readH(),
      columnOrder: [
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
      ],
    };
  }
  componentDidMount() {
  }
  render() {
    return (<Home
      histories={this.state.histories}
      columnOrder={this.state.columnOrder}
    />);
  }
}
