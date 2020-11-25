import * as fs from 'fs'
import * as express from "express";
import bodyParser = require('body-parser');/*post方法*/
import { SaveDTO } from "./request/requestDTO";
import { resolve } from 'path';
const homedir = require('os').homedir();

// Create a new express app instance
const app: express.Application = express();

app.use(bodyParser.json());// 添加json解析
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/', function (req, res) {
  res.send('Hello World11!');
});

app.post('/api/exists', function (req, res) {
  res.send(fs.existsSync(req.body.path));
});

app.get('/api/info', (req, res) => {
  res.json({
    homedir,
    platform: process.platform
  })
})

app.post('/api/save', function (req, res, next) {
  const saveRequest: SaveDTO = req.body
  const parent = resolve(saveRequest.path, '..')
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true })
  }
  fs.writeFileSync(saveRequest.path, saveRequest.content, 'utf8')
  res.json(req.body);
});

app.post('/api/db/connect', function (req, res, next) {
  res.json(req.body);
});

app.post('/api/db/execute', function (req, res, next) {
  res.json(req.body);
});

app.post('/api/db/reverse/parse', function (req, res, next) {
  res.json(req.body);
});

app.post('/api/db/versions', function (req, res, next) {
  res.json(req.body);
});

app.post('/api/db/version/new', function (req, res, next) {
  res.json(req.body);
});

app.listen(8000, function () {
  console.log('App is listening on port 8000!');
});

