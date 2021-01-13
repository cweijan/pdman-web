import history from '@/service/history';
import { download } from '@/utils/download';
import { message as aMessage } from 'antd';
import _object from 'lodash/object';
import React from 'react';
import ReactDom from 'react-dom';
import { open, getFileHandle, write, verifyPermission } from "@/service/fileSaver";
import { Icon, Modal, openModal } from '../components';
import demo from '../demo';
import { fileExist, fileExistPromise, readFilePromise, writeFile } from '../utils/json';
import CreatePro from './CreatePro';
import defaultData from './defaultData.json';
import Header from './Header';
import App from './index';
import './style/home.less';
import { convertOldDbs } from '@/service/db';

/**
 * todo
 * 1. 返回主页时刷新历史记录
 * 2. 历史记录列表项调整, 适配两种历史类型
 * 3. 历史记录需要去重 done
 * 4. 历史删除逻辑
 */
export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.projectName = '';
    this.split = process.platform === 'win32' ? '\\' : '/';
    this.state = {
      projectDemo: '',
      projectHandler: null,
      histories: [],
      dataSource: {
        modules: [],
        dataTypeDomains: defaultData.profile.defaultDataTypeDomains,
      },
      flag: true,
      project: '',
      display: 'none',
      changeDataType: 'reset',
      error: false,
      closeProject: false,
      register: {},
    };
  }
  async componentDidMount() {
    const histories = await history.readNew()
    this.setState({
      histories: histories
    })
    // 设置快捷方式
    this.dom = ReactDom.findDOMNode(this.instance);
    this.dom && this.dom.focus();
    this.dom.onkeydown = (evt) => {
      if ((evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
        if (evt.code === 'KeyD') {
          this._openDev();
        }
      }
    };
  }

  componentWillUnmount() {
    this.dom.onkeydown = null;
  }
  componentDidCatch() {
    Modal.error({ title: '项目数据出错', message: '当前打开的项目不是PDMan的项目格式', width: 300 });
    this.setState({
      error: true,
    });
  }
  _updateRegister = (code) => {
    this.setState({
      register: {
        code: code,
      },
    });
  };
  _openUrl = (url) => {
    // shell.openExternal(url);
  };
  _getProjectName = (item) => {
    const tempItem = item.replace(/\\/g, '/');
    const tempArray = tempItem.split('/');
    return tempArray[tempArray.length - 1];
  };
  _onOk = async (model) => {
    const basePath = this.projectName
    const path = `${basePath}.pdman.json`

    if (await fileExist(path)) {
      aMessage.error('创建项目失败, 该项目已经存在了!');
      model.close()
      return;
    }

    fileExistPromise(path, true, {
      dataTypeDomains: defaultData.profile.defaultDataTypeDomains,
      modules: defaultData.profile.defaultModules,
    }).then(async (res) => {
      // 保存的用户配置
      let newHistories = await history.store(this.state.projectHandler, this.projectName)
      this.setState({
        dataSource: res,
        flag: false,
        histories: newHistories,
        project: basePath,
        projectHandler: null,
        closeProject: false,
        changeDataType: 'reset',
        error: false,
        projectDemo: '',
      });
      model.close()
    })
  };
  _onChange = (value) => {
    this.projectName = value;
  };
  _createObject = async () => {
    openModal(<CreatePro onChange={this._onChange} />, {
      onOk: this._onOk,
      title: '新建项目',
    });
  };
  _delete = (e, historyNew, type) => {
    e && e.stopPropagation();
    const { histories } = this.state;
    let temp = [...histories];
    console.log(temp)
    if (type === 'all') {
      temp = [];
    } else {
      temp = temp.filter(h => h.name !== historyNew);
    }
    this.setState({
      histories: temp,
    }, () => {
      // 保存最新的历史记录
      history.writeNew(temp)
    });
  };
  _checkDatabase = (database = []) => {
    if (!database.some(db => db.defaultDatabase)) {
      return database.map((db, index) => {
        if (index === 0) {
          return {
            ...db,
            defaultDatabase: true,
          };
        }
        return db;
      });
    }
    return database;
  };
  _readData = async (path, callBack) => {
    if (await fileExist(path)) {
      readFilePromise(path).then((res) => {
        this.readData(path, res, callBack)
      }).catch((e) => {
      });
    } else {
      aMessage.error(`项目${path}不存在, 打开失败!`)
      this._delete(null, path);
    }
  };
  readData = (path, res, callBack) => {
    // 过滤已经存在的历史记录
    console.log('read')
    const project = path.split('.pdman.json')[0];
    const histories = (this.state.histories && this.state.histories instanceof Array) ? this.state.histories : [];
    const temp = [...histories].filter(his => his !== project);
    // 把当前的项目插入到第一条数据
    temp.unshift(project);
    callBack && callBack();
    convertOldDbs(res?.profile?.dbs)
    this.setState({
      // histories: temp,
      flag: false,
      dataSource: {
        ...res,
        dataTypeDomains: {
          ...(res.dataTypeDomains || {}),
          database: this._checkDatabase(_object.get(res, 'dataTypeDomains.database', [])),
        },
      },
      changeDataType: 'reset',
      project: project,
      error: false,
      closeProject: false,
      projectDemo: '',
    });
    // 将其存储到历史记录中
    history.writeH(temp)
  };
  openExistsProject = async (callBack) => {
    const extensions = [];
    if (process.platform === 'darwin') {
      extensions.push('json');
    } else {
      extensions.push('pdman.json');
    }
    const { fileHandle, file, text } = await open()
    let newHistories = await history.store(fileHandle, file.name)
    this.setState({
      projectHandler: fileHandle,
      histories: newHistories
    })
    this.readData(file.name, JSON.parse(text))
    callBack && callBack()
  };
  openHistory = async (history) => {
    if (history.type == "file") {
      const fileHandle = history.handler
      this.setState({
        projectHandler: fileHandle
      })
      await verifyPermission(fileHandle, true)
      const file = await fileHandle.getFile()
      const text = await file.text()
      this.readData(file.name, JSON.parse(text))
    } else {
      this._readData(`${history.name}.pdman.json`);
    }
  };
  _openProject = async (path, callBack, type) => {
    // 打开项目
    if (path || type) {
      if (type) {
        callBack && callBack();
        this.setState({
          projectDemo: path,
          flag: false,
          dataSource: demo[path],
          changeDataType: 'reset',
          project: '',
          error: false,
          closeProject: false,
        });
        //this._readData(proPath, callBack, type);
      } else {
        this._readData(`${path}.pdman.json`, callBack);
      }
    } else {
      this.openExistsProject(callBack)
    }
  };
  _saveProject = (path, data, cb, dataHistory, selectCb) => {
    // 保存项目
    const { project } = this.state;
    if (!path && !project) {
      alert("示例项目不可保存!")
      return;
    }

    if (path) {
      const tempData = { ...data };
      if (!tempData) {
        // 保存时增加数据为空提示，防止生成空文件
        Modal.error({
          title: '保存失败！',
          message: '保存失败，请重试！',
        });
      } else {
        const fileHandler = this.state.projectHandler;
        const promise = fileHandler ? write(fileHandler, tempData) : fileExistPromise(path, true, tempData);
        promise.then(() => {
          this.setState({
            dataSource: tempData,
            changeDataType: 'update',
            dataHistory,
          }, () => {
            cb && cb();
          });
        }).catch((e) => {
          console.log(e)
          aMessage.error('保存失败')
        });
      }
    } else {
      download(project + ".json", JSON.stringify(data, null, 2))
    }


  };
  _createClose = () => {
    this.setState({
      display: 'none',
    });
  };
  _closeProject = (dataHistory) => {
    this.setState({
      dataSource: {
        modules: [],
        dataTypeDomains: defaultData.profile.defaultDataTypeDomains,
      },
      changeDataType: 'reset',
      dataHistory,
      project: '',
      closeProject: true,
      display: 'none',
    });
    // ipcRenderer.sendSync('headerType', 'backHome');
  };
  _getAllTableData = (dataSource) => {
    return (dataSource.modules || []).reduce((a, b) => {
      return a.concat((b.entities || []));
    }, []);
  };
  _saveProjectSome = (path, data, cb, dataHistory, type) => {
    // 保存部分数据
    const { dataSource } = this.state;
    const typeArray = type.split('/');
    let tempDataSource = { ...dataSource };
    if (typeArray.length === 0) {
      // 修改模块
      tempDataSource = {
        ...dataSource,
        modules: (dataSource.modules || []).map((module) => {
          if (module.name === typeArray[0]) {
            return data;
          }
          return module;
        }),
      };
    } else if (typeArray.length === 2 && typeArray[1] === 'graphCanvas') {
      tempDataSource = {
        ...dataSource,
        modules: (dataSource.modules || []).map((module) => {
          if (module.name === typeArray[0]) {
            return {
              ...module,
              ...data,
            };
          }
          return module;
        }),
      };
    } else if (typeArray.length === 3) {
      tempDataSource = {
        ...dataSource,
        modules: (dataSource.modules || []).map((module) => {
          if (module.name === typeArray[0]) {
            const changeEntity = (module.entities || [])
              .filter(entity => entity.title === typeArray[2])[0];
            const tempNodes = this._updateTableName(_object.get(module, 'graphCanvas.nodes', []), dataHistory);
            const graphCanvas = {
              ...(module.graphCanvas || {}),
              nodes: tempNodes,
            };
            const entities = changeEntity ? (module.entities || []).map((entity) => {
              if (entity.title === typeArray[2]) {
                return data;
              }
              return entity;
            }) : (module.entities || []).concat(data);
            return {
              ...module,
              graphCanvas,
              entities,
              associations: this._getAssociations(graphCanvas, entities),
            };
          }
          return module;
        }),
      };
      // 因为存在跨模块的情况，此处需要更新所有的连接线
      const newData = this._getAllTableData(tempDataSource);
      const oldData = this._getAllTableData(dataSource);
      tempDataSource = {
        ...tempDataSource,
        modules: (tempDataSource.modules || []).map(m => {
          const tempEdges = _object.get(m, 'graphCanvas.edges', []);
          const tempNodes = _object.get(m, 'graphCanvas.nodes', []);
          return {
            ...m,
            graphCanvas: {
              ...(m.graphCanvas || {}),
              edges: this._updateEdges(tempNodes, oldData, newData, tempEdges)
            }
          }
        })
      }
    }
    this._saveProject(path, tempDataSource, cb, dataHistory);
  };
  _getAssociations = (data, entities = []) => {
    const edges = [...(data.edges || [])];
    const nodes = [...(data.nodes || [])];
    const tempAssociations = edges.map((edge) => {
      const sourceNode = nodes.filter(node => node.id === edge.source)[0];
      const targetNode = nodes.filter(node => node.id === edge.target)[0];
      const sourceEntity = sourceNode.title.split(':')[0];
      const targetEntity = targetNode.title.split(':')[0];
      const sourceEntityData = entities
        .filter(entity => entity.title === sourceEntity)[0] || sourceNode;
      const targetEntityData = entities
        .filter(entity => entity.title === targetEntity)[0] || targetNode;
      /*if (!sourceEntityData || !targetEntityData) {
        //Modal.error({title: '操作失败', message: '该数据表不存在，请先双击编辑保存再操作！', width: 350});
        return null;
      }*/
      const sourceFieldData = (sourceEntityData.fields || [])[parseInt(edge.sourceAnchor / 2, 10)];
      const targetFieldData = (targetEntityData.fields || [])[parseInt(edge.targetAnchor / 2, 10)];
      if (!sourceFieldData || !targetFieldData) {
        return null;
      }
      return {
        relation: edge.relation || '',
        from: {
          entity: sourceEntity,
          field: sourceFieldData.name,
        },
        to: {
          entity: targetEntity,
          field: targetFieldData.name,
        },
      };
    }).filter(association => !!association);
    const tempAssociationsString = [];
    return tempAssociations.filter((association) => {
      const stringData = `${association.from.entity}/${association.to.field}
      /${association.to.entity}/${association.from.field}`;
      if (!tempAssociationsString.includes(stringData)) {
        tempAssociationsString.push(stringData);
        return true;
      }
      return false;
    });
  };
  _getNodeData = (sourceId, targetId, data, nodes) => {
    const tempNodes = nodes.map(n => {
      const table = data.filter(d => d.title === (n.copy || n.title.split(':')[0]))[0];
      return {
        ...n,
        title: (table && table.title) || n.title,
        fields: ((table && table.fields) || []).filter(f => !f.relationNoShow),
      };
    });
    let sourceNode, targetNode = null;
    for (let i = 0; i < tempNodes.length; i++) {
      if (tempNodes[i].id === sourceId) {
        sourceNode = tempNodes[i];
      } else if (tempNodes[i].id === targetId) {
        targetNode = tempNodes[i];
      }
    }
    return {
      sourceNode,
      targetNode
    }
  };
  _updateEdges = (nodes = [], oldData = [], data = [], edges = []) => {
    // 1.过滤掉属性不存在的连接线
    return edges.map((e) => {
      const sourceId = e.source;
      const targetId = e.target;
      const { sourceNode, targetNode } = this._getNodeData(sourceId, targetId, oldData, nodes);
      const sourceIndex = parseInt(e.sourceAnchor / 2, 10);
      const sourceField = sourceNode && sourceNode.fields[sourceIndex];
      const targetIndex = parseInt(e.targetAnchor / 2, 10);
      const targetField = targetNode && targetNode.fields[targetIndex];
      const newSourceNode = data.filter(d => d.title === (sourceNode && sourceNode.title))[0];
      const newTargetNode = data.filter(d => d.title === (targetNode && targetNode.title))[0];
      const newSourceIndex = (newSourceNode && newSourceNode.fields || []).filter(f => !f.relationNoShow)
        .findIndex(f => f.name === (sourceField && sourceField.name));
      const newTargetIndex = (newTargetNode && newTargetNode.fields || []).filter(f => !f.relationNoShow)
        .findIndex(f => f.name === (targetField && targetField.name));
      if (!sourceField || !targetField || (newSourceIndex < 0) || (newTargetIndex < 0)) {
        // 属性不存在了则需要移除
        return null;
      } else {
        // 更新坐标
        return {
          ...e,
          sourceAnchor: sourceIndex === newSourceIndex ? e.sourceAnchor : newSourceIndex * 2,
          targetAnchor: targetIndex === newTargetIndex ? e.targetAnchor : newTargetIndex * 2,
        }
      }
    }).filter(e => !!e);
  };
  _updateTableName = (data = [], dataHistory = {}) => {
    // 将旧表名，替换到新表名
    return data.map((node) => {
      const titleArray = node.title.split(':');
      if (dataHistory.oldName === titleArray[0]) {
        return {
          ...node,
          title: `${dataHistory.newName}${titleArray[1] ? `:${titleArray[1]}` : ''}`,
        };
      }
      return node;
    });
  };
  _openDir = (callBack) => {
    // TODO
    // dialog.showOpenDialog({
    //   title: 'Open Directory',
    //   properties:['openDirectory'],
    // }, (file) => {
    //   if (file) {
    //     callBack && callBack(file[0]);
    //   }
    // });
  };
  _openDev = () => {
    // ipcRenderer.sendSync('headerType', 'openDev');
  };
  _cloneProject = () => {
    aMessage.error("该功能正在开发中，敬请期待！")
  };
  render() {
    if (this.state.flag || this.state.error || this.state.closeProject) {
      const { histories, project, display } = this.state;
      console.log(histories)
      return (
        <div tabIndex="0" className='pdman-home-content' ref={instance => this.instance = instance}>
          <Header project={project} disableMaximize />
          <div className='pdman-home'>
            <div
              className='pdman-home-left'
              style={{ display: display === 'none' ? '' : 'none' }}
            >
              <span className='pdman-home-left-list-name'>最近使用</span>
              <div className='pdman-home-left-list'>
                {
                  (histories || []).map(item => (
                    <div className='pdman-home-left-list-item' key={item.name} onClick={() => this.openHistory(item)}>
                      <div className='pdman-home-left-list-item-name'>{item.name}</div>
                      <div className='pdman-home-left-list-item-icon'>
                        <Icon type='close' onClick={e => this._delete(e, item.name)} />
                      </div>
                      {/* <div className='pdman-home-left-list-item-path'>{item.name}</div> */}
                    </div>
                  ))
                }
              </div>
              <div className='pdman-home-left-demo'>
                <span className='pdman-home-left-demo-name'>参考案例</span>
                <div
                  className='pdman-home-left-list-item pdman-home-left-demo-item'
                  onClick={() => this._openProject('standard', undefined, 'demo')}
                >
                  <Icon type='fa-briefcase' style={{ marginRight: 5 }} />
                  学生信息管理系统
                </div>
              </div>
            </div>
            <div className='pdman-home-right' style={{ display: display === 'none' ? '' : 'none' }}>
              <div className='pdman-home-right-logo'>
                <div className='pdman-home-right-logo-img'>{ }</div>
                <div className='pdman-home-right-logo-title'>
                  <div className='pdman-home-right-logo-title-main'>PDMan</div>
                </div>
              </div>
              <div className='pdman-home-right-opts'>
                <div className='pdman-home-right-opts-icons'>
                  <div className='pdman-home-right-opts-icons-icon'>
                    <div className='pdman-home-right-opts-icons-icon1' />
                  </div>
                  <div className='pdman-home-right-opts-icons-icon'>
                    <div className='pdman-home-right-opts-icons-icon2' />
                  </div>
                </div>
                <div className='pdman-home-right-opts-names'>
                  <div
                    className='pdman-home-right-opts-names-name'
                    onClick={() => this._createObject()}
                  >
                    <span>创建新项目</span>
                  </div>
                  <div
                    className='pdman-home-right-opts-names-name'
                    onClick={() => this.openExistsProject()}
                  >
                    <span>打开项目</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // ipcRenderer.sendSync('loadingSuccess');
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header
          project={this.state.project}
          projectDemo={this.state.projectDemo}
          disableMaximize={!this.state.projectDemo && !this.state.project} />
        <App
          changeDataType={this.state.changeDataType}
          dataSource={this.state.dataSource}
          project={this.state.project}
          saveProject={this._saveProject}
          openObject={this._openProject}
          dataHistory={this.state.dataHistory}
          saveProjectSome={this._saveProjectSome}
          closeProject={this._closeProject}
          columnOrder={this.props.columnOrder}
          writeFile={writeFile}
          openDir={this._openDir}
          projectDemo={this.state.projectDemo}
          register={this.state.register}
          updateRegister={this._updateRegister}
        />
      </div>);
  }
}

