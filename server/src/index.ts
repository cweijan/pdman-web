import * as fs from 'fs'
import * as express from "express";
import bodyParser = require('body-parser');/*post方法*/
import { SaveDTO } from "./request/requestDTO";
const homedir = require('os').homedir();

// Create a new express app instance
const app: express.Application = express();

app.use(bodyParser.json());// 添加json解析
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.send('Hello World11!');
});

app.get('/info', (req, res) => {
  res.json({
    homedir
  })
})

app.post('/save', function (req, res, next) {
  const saveRequest: SaveDTO = req.body
  fs.writeFileSync(saveRequest.path, saveRequest.content, 'utf8')
  res.json(req.body);
});

app.post('/db/connect', function (req, res, next) {
  res.json(req.body);
});

app.post('/db/execute', function (req, res, next) {
  res.json(req.body);
});

app.post('/db/reverse/parse', function (req, res, next) {
  res.json(req.body);
});

app.post('/db/versions', function (req, res, next) {
  res.json(req.body);
});

app.post('/db/version/new', function (req, res, next) {
  res.json(req.body);
});

app.listen(8000, function () {
  console.log('App is listening on port 8000!');
});

