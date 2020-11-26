import { ExecuteDTO } from "../../request/requestDTO";

export interface DbAdapter {
    execute(connect: ExecuteDTO): any | Promise<any>;
}