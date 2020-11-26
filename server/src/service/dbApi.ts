import * as express from "express";
import { ConnnectDTO, ExecuteDTO } from "../request/requestDTO";
import { MysqlApi } from "./adapter/mysql";

module.exports = (app: express.Application) => {


    const mysqlApi = new MysqlApi()

    app.post('/api/db/connect', function (req, res, next) {
        const option: ConnnectDTO = req.body
        mysqlApi.execute({ ...option, sql: 'SELECT 1 + 1 AS solution' }).then(({ error }) => {
            res.json({ success: error == null, msg: error != null ? error.sqlMessage : null })
        })

    });

    app.post('/api/db/execute', function (req, res, next) {
        const option: ExecuteDTO = req.body;
        mysqlApi.execute(option).then(({ error }) => {
            res.json({ success: error == null, msg: error != null ? error.sqlMessage : null })
        })

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


}