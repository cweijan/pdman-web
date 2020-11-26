import * as express from "express";
import bodyParser = require('body-parser');
import { bindFileApi, bindDbApi } from "./service/index";
import { readFileSync } from "fs";

const args = process.argv.slice(2);
const input = args[0];
const port = input ? input : 8000;

const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'))

app.get(['/', "/index.html", '/index'], (req, res) => {
  res.send(readFileSync(__dirname + '/index.html', 'utf8'))
})

app.get('/api/info', (req, res) => {
  res.json({
    homedir: require('os').homedir(),
    platform: process.platform
  })
})

bindFileApi(app)
bindDbApi(app)

app.listen(port, function () {
  console.log(`App is listening on port ${port}!`);
});

