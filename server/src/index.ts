#!/usr/bin/env node
import express from "express";
import { readFileSync } from "fs";
import { bindDbApi } from "./service/dbApi";
import { bindFileApi } from "./service/fileApi";
import { bindRevisionApi } from "./service/revision";
import bodyParser = require('body-parser');

const args = process.argv.slice(2);
const input = args[0];
const port = input ? input : 8000;

const app: express.Application = express();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
app.use(express.static(__dirname + '/public'))
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Content-Security-Policy", "default-src 'self'; script-src *");
  next();
});


app.get(['/', '/index'], (req, res) => {
  res.send(readFileSync(__dirname + '/public/index.html', 'utf8'))
})

app.get('/api/info', (req, res) => {
  res.json({
    homedir: require('os').homedir(),
    platform: process.platform
  })
})

bindFileApi(app)
bindDbApi(app)
bindRevisionApi(app)

app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);

  if(process.env.NODE_ENV?.trim().toUpperCase()!='DEV'){
    var url = `http://localhost:${port}`;
    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + url);
  }
  
});

