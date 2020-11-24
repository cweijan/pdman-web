import * as fs from 'fs'
import express = require('express');
import bodyParser = require('body-parser');/*post方法*/
import { SaveRequest } from "./request/saveRequest";

// Create a new express app instance
const app: express.Application = express();

app.use(bodyParser.json());// 添加json解析
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.post('/save', function (req, res, next) {
  const saveRequest:SaveRequest = req.body
  fs.writeFileSync(saveRequest.path, saveRequest.content, 'utf8')
  res.json(req.body);
});
app.listen(8000, function () {
  console.log('App is listening on port 8000!');
});

