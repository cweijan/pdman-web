import { Client, ClientConfig, QueryArrayResult } from "pg";
import { ConnnectDTO, ExecuteDTO } from "../../request/requestDTO";
import { DbAdapter } from "./DbAdapater";

export class PostgreSQLApi implements DbAdapter {



    public execute(option: ExecuteDTO, client?: Client): Promise<any> {

        if (!client) {
            client = this.getClient(option)
            client.connect();
        }
        return new Promise(async res => {
            const sql = unescape(option.sql)
            const sqlList: string[] = sql.match(/(?:[^;"']+|["'][^"']*["'])+/g)?.filter((s) => (s.trim() != '' && s.trim() != ';'))
            if (sqlList?.length > 1) {
                const error = await this.runBatch(client, sqlList)
                res({ error, connection: client })
                return;
            }
            if (!sqlList) {
                res({ connection: client })
                return;
            }
            return this.queryPromise(client,sql)
        })

    }

    private runBatch(client: Client, sqlList: string[]) {
        return new Promise((resolve) => {
            client.query("BEGIN", async () => {
                try {
                    for (let sql of sqlList) {
                        sql = sql.trim().replace(/\n/g, '')
                        if (!sql) { continue }
                        await this.queryPromise(client, sql)
                    }
                    await client.query("COMMIT")
                    resolve(null)
                } catch (err) {
                    await client.query("ROLLBACK")
                    resolve(err)
                }
            })
        })

    }

    private queryPromise<T>(client: Client, sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            client.query(sql, (err: Error, res) => {
                if (err) {
                    reject(err);
                } else {
                    if (res instanceof Array) {
                        resolve(res.map(row => this.adaptResult(row)))
                    } else {
                        resolve(this.adaptResult(res))
                    }
                }
            });
        });
    }

    private adaptResult(res: QueryArrayResult<any>) {
        if (res.command != 'SELECT' && res.command != 'SHOW') {
            if (res.rows && res.rows instanceof Array) {
                return res.rows;
            }
            return { affectedRows: res.rowCount }
        }
        return res.rows;
    }

    private getClient(option: ConnnectDTO) {
        let config = {
            host: option.url, port: option.port,
            user: option.username, password: option.password,
            database: option.database,
            connectionTimeoutMillis: 5000
        } as ClientConfig;
        // if (option.useSSL) {
        //     config.ssl = {
        //         rejectUnauthorized: false,
        //         ca: (option.caPath) ? fs.readFileSync(option.caPath) : null,
        //         cert: (option.clientCertPath) ? fs.readFileSync(option.clientCertPath) : null,
        //         key: (option.clientKeyPath) ? fs.readFileSync(option.clientKeyPath) : null,
        //     }
        // }
        return new Client(config);
    }

}
