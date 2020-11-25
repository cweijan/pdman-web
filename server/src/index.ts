import * as express from "express";
import bodyParser = require('body-parser');
import { bindFileApi, bindDbApi } from "./service/index";

const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/info', (req, res) => {
  res.json({
    homedir: require('os').homedir(),
    platform: process.platform
  })
})

bindFileApi(app)
bindDbApi(app)

app.listen(8000, function () {
  console.log('App is listening on port 8000!');
});

