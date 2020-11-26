import { post } from '@/service/ajax';
import _object from 'lodash/object';
import React from 'react';
import { Button, Icon, Input, Modal, openModal, RadioGroup, Select } from '../components';
import { uuid } from '../utils/uuid';
import { message as aMessage } from 'antd';
import './style/jdbc.less';

const Radio = RadioGroup.Radio;

export default class JDBCConfig extends React.Component {
  constructor(props) {
    super(props);
    this.split = process.platform === 'win32' ? '\\' : '/';
    const data = this._initData(props.data || []);
    this.state = {
      selectedTrs: this._getDefaultDBSelected(data),
      data,
      loading: false,
    };
    this.url = {
      mysql: {
        url: '127.0.0.1',
        username: 'root',
        port: 3306,
        driverClass: 'com.mysql.jdbc.Driver',
      },
      oracle: {
        url: 'jdbc:oracle:thin:@IP地址:端口号/数据库名',
        driverClass: 'oracle.jdbc.driver.OracleDriver',
      },
      sqlserver: {
        url: 'jdbc:sqlserver://IP地址:端口号;DatabaseName=数据库名',
        driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
      },
      postgresql: {
        url: 'jdbc:postgresql://IP地址:端口号/数据库名',
        driverClass: 'org.postgresql.Driver',
      },
    };
  }
  _getDefaultDBSelected = (data) => {
    const defaultData = data.filter(d => d.defaultDB)[0] || data[0];
    return defaultData ? [defaultData.key] : [];
  };
  _initData = (data) => {
    return data.map(d => ({
      ...d,
      key: uuid(),
    }));
  };
  _trClick = (e, key) => {
    //e.stopPropagation();
    //e.preventDefault();
    const { selectedTrs } = this.state;
    let tempSelectedTrs = [...selectedTrs];
    if (tempSelectedTrs.some(tr => tr === key)) {
      tempSelectedTrs = e && e.shiftKey ? tempSelectedTrs.filter(tr => tr !== key) : [];
    } else {
      e && e.shiftKey ? tempSelectedTrs.push(key) : tempSelectedTrs = [key];
    }
    this.setState({
      selectedTrs: tempSelectedTrs,
    });
  };
  _deleteDB = () => {
    const { onChange } = this.props;
    const { data, selectedTrs } = this.state;
    let tempFields = [...(data || [])];
    const minIndex = Math.min(...tempFields
      .map((field, index) => {
        if (selectedTrs.includes(field.key)) {
          return index;
        }
        return null;
      }).filter(field => field !== null));
    const newFields = (data || []).filter(fid => !selectedTrs.includes(fid.key));
    const selectField = newFields[(minIndex - 1) < 0 ? 0 : minIndex - 1];
    this.setState({
      selectedTrs: (selectField && [selectField.key]) || [],
      data: newFields,
    }, () => {
      onChange && onChange(this.state.data.map(field => _object.omit(field, ['key'])));
    });
  };
  _addDB = () => {
    const { onChange, dataSource } = this.props;
    const { data = [], selectedTrs } = this.state;
    const tempFields = [...data];
    const key = uuid();
    const selectedTrsIndex = tempFields
      .map((field, index) => {
        if (selectedTrs.includes(field.key)) {
          return index;
        }
        return null;
      }).filter(field => field !== null);
    const database = _object.get(dataSource, 'dataTypeDomains.database', [])[0] || {};
    const dbName = (database.type || 'mysql').toLocaleLowerCase();
    const defaultDBData = this.url[dbName] || {};
    const newField = {
      name: tempFields.length == 0 ? 'dev' : '',
      key: key,
      type: dbName.toUpperCase(),
      defaultDB: false,
      properties: {
        'driver_class_name': defaultDBData.driverClass,
        url: defaultDBData.url,
        password: '',
        username: defaultDBData.username,
        port: defaultDBData.port,
      },
    };
    if (selectedTrsIndex.length > 0) {
      tempFields.splice(Math.max(...selectedTrsIndex) + 1, 0, newField);
    } else {
      tempFields.push(newField);
    }
    this.setState({
      data: tempFields.map((f) => {
        if (f.key === key) {
          return {
            ...f,
            defaultDB: true,
          };
        }
        return {
          ...f,
          defaultDB: false,
        };
      }),
    }, () => {
      onChange && onChange(this.state.data.map(field => _object.omit(field, ['key'])));
      this._trClick(null, newField.key);
    });
  };
  _onDBChange = (key, e, name) => {
    const { onChange } = this.props;
    const { data } = this.state;
    this.setState({
      data: data.map((d) => {
        if (d.key === key) {
          let properties = {
            ...(d.properties || {}),
          };
          if (name === 'type') {
            const dbName = (e.target.value || 'mysql').toLocaleLowerCase();
            const defaultDBData = this.url[dbName] || {};
            properties = {
              ...properties,
              'driver_class_name': defaultDBData.driverClass,
              url: defaultDBData.url,
            };
          }
          return {
            ...d,
            [name]: e.target.value,
            properties,
          };
        }
        return d;
      }),
    }, () => {
      onChange && onChange(this.state.data.map(field => _object.omit(field, ['key'])));
    });
  };
  _onChange = (name, e) => {
    const { onChange } = this.props;
    const { selectedTrs, data } = this.state;
    const key = selectedTrs[selectedTrs.length - 1];
    this.setState({
      data: data.map((d) => {
        if (d.key === key) {
          return {
            ...d,
            properties: {
              ...(d.properties || {}),
              [name]: (e.target.value || '').replace(/(^\s|\s$)/g, ''),
            },
          };
        }
        return d;
      }),
    }, () => {
      //console.log(this.state.data);
      onChange && onChange(this.state.data.map(field => _object.omit(field, ['key'])));
    });
  };
  _connectJDBC = (selectJDBC) => {
    const { properties = {} } = (selectJDBC || {});
    this.setState({
      loading: true,
    });
    post('/api/db/connect', properties).then(res => {
      if (res.success) {
        aMessage.success('数据库连接配置成功')
      } else {
        aMessage.error(res.msg)
      }
      this.setState({
        loading: false,
      });
    });


  };
  _defaultDBChange = (value) => {
    const { data } = this.state;
    const { onChange } = this.props;
    this.setState({
      data: data.map((field) => {
        if (field.key === value) {
          return { ...field, defaultDB: true };
        }
        return { ...field, defaultDB: false };
      }),
    }, () => {
      onChange && onChange(this.state.data.map(field => _object.omit(field, ['key'])));
      this._trClick(null, value);
    });
  };
  _getData = () => {
    const { data } = this.state;
    return data.filter(d => d.defaultDB)[0];
  };
  _showHelp = () => {
    let modal = null;
    const onClickCancel = () => {
      modal && modal.close();
    };
    const { mysql, oracle, sqlserver, postgresql } = this.url;
    modal = openModal(<div>
      <div style={{ border: 'solid 1px green', padding: 5, margin: 5 }}>
        <div style={{ color: '#000000' }}>MYSQL配置示例：↓</div>
        <div style={{ color: 'green' }}>driver_class：
          <span style={{ color: 'red', userSelect: 'text' }}>{mysql.driverClass}</span>
        </div>
        <div style={{ color: 'green' }}>url：<span style={{ color: 'red', userSelect: 'text' }}>{mysql.url}</span></div>
      </div>
      <div style={{ border: 'solid 1px green', padding: 5, margin: 5 }}>
        <div style={{ color: '#000000' }}>ORACLE配置示例：↓</div>
        <div style={{ color: 'green' }}>driver_class：
          <span style={{ color: 'red', userSelect: 'text' }}>{oracle.driverClass}</span>
        </div>
        <div style={{ color: 'green' }}>url：<span style={{ color: 'red', userSelect: 'text' }}>{oracle.url}</span></div>
      </div>
      <div style={{ border: 'solid 1px green', padding: 5, margin: 5 }}>
        <div style={{ color: '#000000' }}>SQLServer配置示例：↓</div>
        <div style={{ color: 'green' }}>driver_class：
          <span style={{ color: 'red', userSelect: 'text' }}>{sqlserver.driverClass}</span>
        </div>
        <div style={{ color: 'green' }}>url：<span style={{ color: 'red', userSelect: 'text' }}>{sqlserver.url}</span></div>
      </div>
      <div style={{ border: 'solid 1px green', padding: 5, margin: 5 }}>
        <div style={{ color: '#000000' }}>PostgreSQL配置示例：↓</div>
        <div style={{ color: 'green' }}>driver_class：
          <span style={{ color: 'red', userSelect: 'text' }}>{postgresql.driverClass}</span>
        </div>
        <div style={{ color: 'green' }}>url：<span style={{ color: 'red', userSelect: 'text' }}>{postgresql.url}</span></div>
      </div>
    </div>, {
      title: 'JDBC配置示例',
      footer: [<Button key="cancel" onClick={onClickCancel} style={{ marginLeft: 10 }}>关闭</Button>],
    });
  };
  _selectJar = () => {
    // dialog.showOpenDialog({
    //   title: '选择驱动jar包',
    //   properties:['openFile'],
    //   filters: [{name: 'PDMan自定义驱动', extensions: ['jar']}],
    // }, (file) => {
    //   if (file) {
    //     this._onChange('customer_driver', {
    //       target: {
    //         value: file[0],
    //       },
    //     });
    //   }
    // });
  };
  render() {
    const { dataSource } = this.props;
    const { selectedTrs, data } = this.state;
    // properties
    let selectJDBC = {};
    if (selectedTrs.length > 0) {
      const key = selectedTrs[selectedTrs.length - 1];
      selectJDBC = data.filter(d => d.key === key)[0] || {};
    }
    const defaultDB = this._getData();
    const database = _object.get(dataSource, 'dataTypeDomains.database', []);
    return (<div className='pdman-jdbc-config'>
      <div className='pdman-jdbc-config-left'>
        <div className='pdman-jdbc-config-left-db-opt'>
          <Icon
            onClick={() => selectedTrs.length !== 0 && this._deleteDB()}
            className={selectedTrs.length === 0 ?
              'pdman-data-table-content-table-disabled-icon'
              : 'pdman-data-table-content-table-normal-icon'}
            type="fa-minus"
          />
          <Icon
            onClick={() => this._addDB()}
            className='pdman-data-table-content-table-normal-icon'
            type="fa-plus"
          />
          <span>{defaultDB ? `当前数据库版本使用的数据库为【${defaultDB.name}】` : '当前数据库版本未选择默认数据库'}</span>
        </div>
        <div className='pdman-jdbc-config-left-db-list'>
          {
            data.map((d, index) => (
              <div
                className={`pdman-jdbc-config-left-db-list-item pdman-data-table-content-table-normal-tr
                        ${selectedTrs.some(tr => tr === d.key) ? 'pdman-data-table-content-table-selected-tr' : ''}`}
                key={d.key}
              >
                <RadioGroup
                  name='defaultDB'
                  title='选择默认版本管理的数据库'
                  value={defaultDB && defaultDB.key || selectedTrs[0]}
                  onChange={this._defaultDBChange}
                >
                  <Radio
                    wrapperStyle={{ width: 28 }}
                    value={d.key}
                    radioStyle={{ width: '98%' }}
                  //onClick={e => this._trClick(e, d.key)}
                  >
                    <span
                      className='pdman-jdbc-config-left-db-list-item-index'
                    >{index + 1}</span>
                    <Input onChange={e => this._onDBChange(d.key, e, 'name')} value={d.name} />
                    <Select onChange={e => this._onDBChange(d.key, e, 'type')} defaultValue={d.type} style={{ width: '200px' }}>
                      {
                        database
                          .map(db => (<option key={db.code} value={db.code}>{db.code}</option>))
                      }
                    </Select>
                  </Radio>
                </RadioGroup>
              </div>
            ))
          }
        </div>
      </div>
      <div className='pdman-jdbc-config-right' style={{ display: selectedTrs.length > 0 ? '' : 'none' }}>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-label'>
            <span className='pdman-jdbc-config-right-com-label-require'>url:</span>
          </div>
          <div className='pdman-jdbc-config-right-com-input'>
            <input
              onChange={e => this._onChange('url', e)}
              value={_object.get(selectJDBC, 'properties.url', '')}
            />
          </div>
        </div>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-label'>
            <span className='pdman-jdbc-config-right-com-label-require'>port:</span>
          </div>
          <div className='pdman-jdbc-config-right-com-input'>
            <input
              onChange={e => this._onChange('port', e)}
              value={_object.get(selectJDBC, 'properties.port', '')}
            />
          </div>
        </div>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-label'>
            <span className='pdman-jdbc-config-right-com-label-require'>database:</span>
          </div>
          <div className='pdman-jdbc-config-right-com-input'>
            <input
              onChange={e => this._onChange('database', e)}
              value={_object.get(selectJDBC, 'properties.database', '')}
            />
          </div>
        </div>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-label'>
            <span className='pdman-jdbc-config-right-com-label-require'>username:</span>
          </div>
          <div className='pdman-jdbc-config-right-com-input'>
            <input
              onChange={e => this._onChange('username', e)}
              value={_object.get(selectJDBC, 'properties.username', '')}
            />
          </div>
        </div>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-label'>
            <span className='pdman-jdbc-config-right-com-label-require'>password:</span>
          </div>
          <div className='pdman-jdbc-config-right-com-input'>
            <input
              onChange={e => this._onChange('password', e)}
              value={_object.get(selectJDBC, 'properties.password', '')}
            />
          </div>
        </div>
        <div className='pdman-jdbc-config-right-com'>
          <div className='pdman-jdbc-config-right-com-button-test'>
            <Button
              loading={this.state.loading}
              onClick={() => this._connectJDBC(selectJDBC)}
            >
              {this.state.loading ? '正在连接' : '测试'}
            </Button>
          </div>
        </div>
      </div>
    </div>);
  }
}
