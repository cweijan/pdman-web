import * as express from "express";

export function pressError(res: express.Response, fun: Function) {
    try {
        fun()
    } catch (error) {
        res.json({ success: false, msg: error?.sqlMessage })
    }
}