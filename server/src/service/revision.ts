import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
 
const dataDDL=`CREATE TABLE revision_data(  
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  pdman_id text not null,
  revision text not null,
  content text not null
);`

function openDb() {
  return open({
    filename: __dirname + '/revision_data.db',
    driver: sqlite3.Database
  })
}

export async function initRevision() {
  const db = await openDb();
  const revisionData=await db.get(`SELECT name, type FROM sqlite_master WHERE type="table" AND name='revision_data';`);
  if(revisionData)return;
  console.log(revisionData)
  db.exec(dataDDL)

}