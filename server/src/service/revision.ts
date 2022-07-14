import { Application } from 'express';
import { pressError } from './uti';
import { NewProjectVersion } from '../request/requestDTO';

const dataDDL = `CREATE TABLE revision_data(  
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  project_id text not null,
  version text not null,
  remark text not null,
  content text not null
);`

function openDb() {
  // return open({
  //   filename: __dirname + '/revision_data.db',
  //   driver: sqlite3.Database
  // })
}

async function initRevision() {
  // const db = await openDb();
  // const revisionData = await db.get(`SELECT name, type FROM sqlite_master WHERE type="table" AND name='revision_data';`);
  // if (revisionData) return;
  // db.exec(dataDDL)
}

export async function bindRevisionApi(app: Application) {

  // initRevision()

  // app.get('/api/project/version', async (req, res, next) => {
  //   pressError(res, async () => {
  //     const projectId = req.query.projectId;
  //     const db = await openDb();
  //     const versionData=await db.all(`select * from revision_data where project_id=${projectId}`)
  //     res.json(versionData);
  //   })
  // });

  // app.post('/api/project/version/new', async function (req, res, next) {
  //   pressError(res, async () => {
  //     const option: NewProjectVersion = req.body;
  //     const db = await openDb();

  //     db.run(`insert into revision_data(project_id,version,remark,content) values ('${option.projectId}','${option.version}','${option.remark}','${option.content}')`)

  //   })
  // });

}