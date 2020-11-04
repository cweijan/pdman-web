import React from 'react';
import _object from 'lodash/object';
import defaultData from '../../defaultData';
import { openModal, Modal } from '../../../components';

import { Input } from 'antd';

const clipboard = require('electron').clipboard;

const validateTable = (data) => {
  let flag = false;
  if (data && data.title && typeof data.title === 'string') {
    if (data.fields && Array.isArray(data.fields)) {
      flag = true;
    }
  }
  return flag;
};

const validateTableAndNewName = (tables, newName) => {
  if (tables.some(table => table === newName)) {
    return validateTableAndNewName(tables, `${newName}-副本`);
  }
  return newName;
};

const getAllTable = (dataSource) => {
  return (dataSource.modules || []).reduce((a, b) => {
    return a.concat((b.entities || []).map(entity => entity.title));
  }, []);
};

export const addTable = (moduleName, dataSource, cb) => {
  let tempTableName = '';
  let tempTableChnName = '';
  let flag = true;
  openModal(<div>
      <Input style={{ width: '100%' }} addonBefore="表　名" onChange={e => tempTableName = e.target.value} />
      <Input style={{ width: '100%' }} addonBefore="中文名" onChange={e => tempTableChnName = e.target.value} />
  </div>, {
    width:'300px',
    title: 'PDMan-新增数据表',
    onOk: (modal) => {

      const resultName = validateTableAndNewName(getAllTable(dataSource), tempTableName);
      if (resultName !== tempTableName) {
        Modal.error({ title: '新增失败', message: '表名已经存在了' });
        return;
      }

      if (!tempTableName) {
        Modal.error({ title: '新增失败', message: '数据表名不能为空' });
      } else if (tempTableName.includes('/') || tempTableName.includes('&') || tempTableName.includes(':')) {
        Modal.error({ title: '新增失败', message: '数据表名不能包含/或者&或者:' });
      } else {
        const defaultFields = _object.get(dataSource, 'profile.defaultFields', defaultData.profile.defaultFields);
        tempTableName && flag && modal && modal.close();
        tempTableName && flag && cb && cb({
          ...dataSource,
          modules: (dataSource.modules || []).map((module) => {
            if (module.name === moduleName) {
              return {
                ...module,
                entities: (module.entities || []).concat({
                  title: tempTableName,
                  chnname: tempTableChnName,
                  fields: defaultFields || [],
                }),
              };
            }
            return module;
          }),
        });
      }
    },
  });
};

export const deleteTable = (moduleName, tableName, dataSource, cb) => {
  cb && cb({
    ...dataSource,
    modules: (dataSource.modules || []).map((module) => {
      if (module.name === moduleName) {
        return {
          ...module,
          entities: (module.entities || []).filter(entity => entity.title !== tableName),
        };
      }
      return module;
    }),
  });
};

export const renameTable = (moduleName, oldTableName, dataSource, cb) => {
  let tempTableName = oldTableName;
  let flag = true;
  openModal(<div>
    <Input.Group compact>
      <Input style={{ width: '50%' }} addonBefore="表名" onChange={e => tempTableName = e.target.value} defaultValue={oldTableName} />
    </Input.Group>
  </div>, {
    title: 'PDMan-重命名数据表',
    onOk: (modal) => {
      if (tempTableName === oldTableName) {
        Modal.error({ title: '重命名失败', message: '数据表名不能与旧名相同' });
        return;
      }

      const resultName = validateTableAndNewName(getAllTable(dataSource), tempTableName);
      if (resultName !== tempTableName) {
        Modal.error({ title: '重命名失败', message: '表名已经存在了' });
        return;
      }

      if (tempTableName.includes('/') || tempTableName.includes('&') || tempTableName.includes(':')) {
        Modal.error({ title: '新增失败', message: '数据表名不能包含/或者&或者:' });
        return;
      }

      flag && modal && modal.close();
      flag && cb && cb({
        ...dataSource,
        modules: (dataSource.modules || []).map((module) => {
          if (module.name === moduleName) {
            return {
              ...module,
              entities: (module.entities || []).map((entity) => {
                if (entity.title === oldTableName) {
                  return {
                    ...entity,
                    title: tempTableName,
                  };
                }
                return entity;
              }),
            };
          }
          return module;
        }),
      }, { oldName: oldTableName, newName: tempTableName });
    },
  });
};

export const copyTable = (moduleName, tableName, dataSource) => {
  const tempModule = (dataSource.modules || []).filter(module => module.name === moduleName)[0];
  if (tempModule) {
    let table = [];
    if (tableName) {
      table = (tempModule.entities || []).filter(entity => entity.title === tableName);
    } else {
      table = tempModule.entities;
    }
    clipboard.writeText(
      JSON.stringify(table));
  }
};

export const cutTable = (moduleName, tableName, dataSource) => {
  const tempModule = (dataSource.modules || []).filter(module => module.name === moduleName)[0];
  if (tempModule) {
    let table = [];
    if (tableName) {
      table = (tempModule.entities || []).filter(entity => entity.title === tableName);
    } else {
      table = tempModule.entities;
    }
    clipboard.writeText(
      JSON.stringify(table.map(entity => ({ ...entity, rightType: 'cut' }))));
  }
};

export const pasteTable = (moduleName, dataSource, cb) => {
  // 粘贴模块
  const copyTables = [];
  let data = [];
  try {
    data = JSON.parse(clipboard.readText());
  } catch (err) {
    console.log('数据格式错误，无法粘贴', err);
  }
  if (data.__temp__) {
    data = _object.get(data, '__temp__.entities');
  }
  // 判断粘贴板的数据是否符合模块的格式
  if (Array.isArray(data) && data.every(table => validateTable(table))) {
    const tempsData = data.filter(d => d.rightType === 'cut').map(d => d.title);
    cb && cb({
      ...dataSource,
      modules: (dataSource.modules || [])
        .map((module) => {
          if (module.name === moduleName) {
            return {
              ...module,
              entities: (module.entities || [])
                .filter(entity => !tempsData.includes(entity.title))
                .concat(data.map((da) => {
                  const title = validateTableAndNewName(
                    getAllTable(dataSource)
                      .filter(entity => !tempsData.includes(entity)).concat(copyTables),
                    da.title);
                  copyTables.push(title);
                  return {
                    ..._object.omit(da, ['rightType']),
                    title,
                  };
                })),
            };
          }
          return module;
        }),
    });
  } else {
    console.log('无效的数据格式');
  }
};
