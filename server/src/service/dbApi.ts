import * as express from "express";
import { ConnnectDTO, ExecuteDTO, NewVersionDTO } from "../request/requestDTO";
import { MysqlApi } from "./adapter/mysql";

function pressError(res: express.Response, fun: Function) {
    try {
        fun()
    } catch (error) {
        res.json({ success: false, msg: error?.sqlMessage })
    }
}

module.exports = (app: express.Application) => {

    const mysqlApi = new MysqlApi()



    app.post('/api/db/connect', async (req, res, next) => {
        pressError(res, async () => {
            const option: ConnnectDTO = req.body
            const { error, connection } = await mysqlApi.execute({ ...option, sql: 'SELECT 1 + 1 AS solution' })
            res.json({ success: error == null, msg: error?.sqlMessage })
            connection.end()
        })
    });

    app.post('/api/db/execute', async (req, res, next) => {
        pressError(res, async () => {
            const { error, connection } = await mysqlApi.execute(req.body as ExecuteDTO);
            res.json({ success: error == null, msg: error?.sqlMessage })
            connection.end()
        })
    });

    app.post('/api/db/version/new', async function (req, res, next) {
        pressError(res, async () => {
            const option: NewVersionDTO = req.body;

            const { error, connection } = await mysqlApi.execute(option);
            if (error) {
                res.json({ success: false, msg: error.sqlMessage })
                connection.end()
                return;
            }

            await mysqlApi.execute({ ...option, sql: `CREATE TABLE if not exists PDMAN_DB_VERSION ( id int PRIMARY  KEY  AUTO_INCREMENT , DB_VERSION varchar(256), VERSION_DESC varchar(1024), CREATED_TIME timestamp default current_timestamp )` })


            mysqlApi.execute({ ...option, sql: `insert into PDMAN_DB_VERSION(DB_VERSION,VERSION_DESC) values ('${option.version}','${option.message}')` }, connection)
                .then(({ error }) => {
                    res.json({ success: error == null, msg: error?.sqlMessage })
                    connection.end()
                })
        })
    });

    app.post('/api/db/reverse/parse', function (req, res, next) {
        pressError(res, async () => {

            if (false) {
                res.json({
                    dbType: "MYSQL",
                    properties: {},
                    dataTypeMap: {},
                    module: {
                        name: "逆向解析",
                        code: 'reverse_parse',
                        entities: [
                            {
                                title: '',
                                chnname: '',
                                fields: [{
                                    name: '',
                                    type: '',
                                    chnname: '',
                                    remark: '',
                                    pk: false,
                                    notNull: false,
                                    autoIncrement: false,
                                    defaultValue: ''
                                }]
                            }
                        ]
                    }
                })
            }


            res.json(req.body);
        })
    });

    app.post('/api/db/versions', function (req, res, next) {
        pressError(res, async () => {
            res.json(req.body);
        })
    });

}