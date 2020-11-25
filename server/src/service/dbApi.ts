import * as express from "express";
import { ConnnectDTO, ExecuteDTO } from "../request/requestDTO";
import * as mysql from "mysql";

module.exports = (app: express.Application) => {

    app.post('/api/db/connect', function (req, res, next) {

        const option: ConnnectDTO = req.body

        var connection = mysql.createConnection({
            host: option.url,
            user: option.username,
            password: option.password,
            database: option.database
        });
        connection.connect();
        connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            res.json({ success: error == null, msg: error != null ? error.sqlMessage : null })
            connection.end();
        });

    });

    app.post('/api/db/execute', function (req, res, next) {
        const option: ExecuteDTO = req.body;
        var connection = mysql.createConnection({
            host: option.url,
            user: option.username,
            password: option.password,
            database: option.database,
            multipleStatements: true
        });
        // TODO 不能批量保存
        connection.connect();
        const sql=unescape(option.sql);
        connection.query(sql, function (error, results, fields) {
            res.json({ success: error == null, msg: error != null ? error.sqlMessage : null })
            connection.end();
        });
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