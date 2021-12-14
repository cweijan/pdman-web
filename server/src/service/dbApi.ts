import * as express from "express";
import { ConnnectDTO, ExecuteDTO, NewVersionDTO } from "../request/requestDTO";
import { MysqlApi } from "./adapter/mysql";
import { PostgreSQLApi } from "./adapter/pg";
import { pressError } from "./uti";
var nodeUrl = require('url');

export function bindDbApi(app: express.Application) {

    const apiMap = { mysql: new MysqlApi(), pg: new PostgreSQLApi() }

    app.use((req, _, next) => {
        const opt = req.body;
        if (opt.url && opt.url.startsWith('jdbc:')) {
            opt.url = nodeUrl.parse(opt.url.replace('jdbc:', '')).hostname;
        }
        next();
    });

    app.post('/api/db/connect', async (req, res, next) => {
        pressError(res, async () => {
            const option: ConnnectDTO = req.body
            const mysqlApi = apiMap.mysql;
            const { error, connection } = await mysqlApi.execute({ ...option, sql: 'SELECT 1 + 1 AS solution' })
            res.json({ success: error == null, msg: error?.sqlMessage || error?.message })
            connection.end()
        })
    });

    app.post('/api/db/execute', async (req, res, next) => {
        pressError(res, async () => {
            const mysqlApi = apiMap.mysql;
            const { error, connection } = await mysqlApi.execute(req.body as ExecuteDTO);
            res.json({ success: error == null, msg: error?.sqlMessage })
            connection.end()
        })
    });

    app.post('/api/db/reverse/parse', function (req, res, next) {
        const option = req.body
        pressError(res, async () => {


            const dataTypeMap = {};

            const mysqlApi = apiMap.mysql;
            const { error, results: tables, connection } = await mysqlApi.execute({ ...option, sql: `SELECT table_comment comment,TABLE_NAME name FROM information_schema.TABLES  WHERE TABLE_SCHEMA = '${option.database}' and TABLE_TYPE<>'VIEW' order by table_name;` })

            const entities = await Promise.all(tables.map(async (table) => {

                const { results: columns } = await mysqlApi.execute({ ...option, sql: `SELECT COLUMN_NAME name,DATA_TYPE simpleType,COLUMN_TYPE type,COLUMN_COMMENT comment,COLUMN_KEY \`key\`,IS_NULLABLE nullable,CHARACTER_MAXIMUM_LENGTH maxLength,COLUMN_DEFAULT defaultValue,EXTRA extra FROM information_schema.columns WHERE table_schema = '${option.database}' AND table_name = '${table.name}' ORDER BY ORDINAL_POSITION;` }, connection)
                return {
                    title: table.name,
                    chnname: table.comment,
                    fields: await Promise.all(columns.map(column => {
                        dataTypeMap[column.type] = {
                            name: column.type,
                            code: column.type,
                            type: column.type
                        }
                        return {
                            name: column.name,
                            type: column.type,
                            chnname: column.comment,
                            remark: '',
                            pk: column.key == "PRI",
                            notNull: column.nullable != "YES",
                            autoIncrement: column.extra.toLowerCase() == "auto_incremen",
                            defaultValue: column.defaultValue
                        }
                    }))
                }
            }))


            res.json({
                status: "SUCCESS",
                body: {
                    dbType: "MYSQL",
                    properties: {},
                    dataTypeMap,
                    module: {
                        name: "逆向解析",
                        code: 'reverse_parse',
                        entities
                    }
                }
            })


        })
    });

    app.post('/api/db/versions', function (req, res, next) {
        pressError(res, async () => {
            res.json(req.body);
        })
    });

    app.post('/api/db/version/new', async function (req, res, next) {
        pressError(res, async () => {
            const option: NewVersionDTO = req.body;

            const mysqlApi = apiMap.mysql;
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

}