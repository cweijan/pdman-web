import * as mysql from "mysql";
import { ExecuteDTO } from "../../request/requestDTO";
import { DbAdapter } from "./DbAdapater";

export class MysqlApi implements DbAdapter {

    public execute(option: ExecuteDTO, connection?: mysql.Connection):Promise<any> {

        if (!connection) {
            var connection = mysql.createConnection({
                host: option.url,
                port: option.port,
                user: option.username,
                password: option.password,
                database: option.database,
                multipleStatements: true,
                connectTimeout:5000
            });
            connection.connect();
        }
        return new Promise(async res => {
            const sql = unescape(option.sql)
            const sqlList: string[] = sql.match(/(?:[^;"']+|["'][^"']*["'])+/g)?.filter((s) => (s.trim() != '' && s.trim() != ';'))
            if (sqlList?.length > 1) {
                const error = await this.runBatch(connection, sqlList)
                res({ error, connection })
                return;
            }
            if (!sqlList) {
                res({ connection })
                return;
            }
            connection.query(sql, (error, results, fields) => {
                res({ error, results, fields, connection })
            });
        })

    }

    private runBatch(connection: mysql.Connection, sqlList: string[]) {
        return new Promise((resolve) => {
            connection.beginTransaction(async () => {
                try {
                    for (let sql of sqlList) {
                        sql = sql.trim().replace(/\n/g, '')
                        if (!sql) { continue }
                        await this.queryPromise(connection, sql)
                    }
                    connection.commit()
                    resolve(null)
                } catch (err) {
                    connection.rollback()
                    resolve(err)
                }
            })
        })

    }

    private queryPromise<T>(connection: mysql.Connection, sql: string): Promise<T> {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err: mysql.MysqlError, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }


}
