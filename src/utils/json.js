import { get, post } from '@/service/ajax';

// 判断文件是否存在
function fileExist(filePath) {
  return post('/api/exists', {
    path: filePath
  })
}

async function fileExistPromise(filePath, isCreate, obj, file = '.json') {
  post("/api/save", {
    path: filePath,
    content: JSON.stringify(obj)
  })
  return filePath.endsWith(file) ? obj : filePath;
}

// 异步保存json文件返回Promise
async function saveFilePromise(jsonObj, filePath) {
  post("/api/save", {
    path: filePath,
    content: JSON.stringify(jsonObj)
  })
  return jsonObj;
}

function checkFileExistPromise(filePath) {
  return post('/api/exists', {
    path: filePath
  })
}

function copyFileSync(from, to) {
  return post('/api/copy', {
    from, to
  })
}

// 仅删除目录下的文件
function deleteJsonFile(filePath) {
  return post("/api/delete", {
    path: filePath
  })
}

// 删除目录下所有文件
function deleteDirectoryFile(filePath) {
  return post("/api/delete", {
    path: filePath
  })
}

function ensureDirectoryExistence(dirPath) {
}

function readFile(file) {
  return post("/api/read", {
    path: file
  })
}

// 同步读取json文件
function readFileSync(filePath) {
  return post("/api/read", {
    path: filePath
  })
}
// 异步读取json文件返回Promise
function readFilePromise(filePath) {
  return post("/api/read", {
    path: filePath
  })
}
// 异步读取json文件通过回调
function readFileCall(filePath, callBack) {
  post("/api/read", {
    path: filePath
  }).then(callBack)
}

function writeFile(file, dataBuffer) {
  post("/api/save", {
    path: file,
    content: dataBuffer
  })
}

// 同步保存json文件
function saveFileSync(jsonObj, filePath) {
  post("/api/save", {
    path: filePath,
    content: JSON.stringify(jsonObj)
  })
}

// 异步保存json文件返回Promise
function storeJson(jsonObj, filePath) {
  localStorage.setItem(filePath, JSON.stringify(jsonObj))
}


// 异步保存json文件通过回调
function saveFileCall(jsonObj, filePath, callBack) {
  post("/api/save", {
    path: filePath,
    content: JSON.stringify(jsonObj)
  }).then(callBack)
}


function getProjectVersion(projectId) {
  return get("/api/project/version?projectId=" + projectId)
}

function saveNewProjectVersion(projectId, version, remark, content) {
  return post("/api/project/version/new", {
    projectId, version, remark, content
  })
}

function getDirListPromise(dir, baseName) {
  return post("/api/read/dir", {
    path: dir,
    baseName,
  })
}


export {
  fileExist,
  fileExistPromise,
  checkFileExistPromise,
  copyFileSync,
  deleteJsonFile,
  deleteDirectoryFile,
  ensureDirectoryExistence,
  readFile,
  readFileSync,
  readFilePromise,
  readFileCall,
  writeFile,
  saveFileSync,
  storeJson,
  saveFilePromise,
  saveFileCall,
  getDirListPromise,
  getProjectVersion,
  saveNewProjectVersion
};

