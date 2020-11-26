import { PageHeader } from "antd";
import * as express from "express";
import * as fs from 'fs';
import { basename, resolve } from 'path';
import { SaveDTO } from "../request/requestDTO";

module.exports = (app: express.Application) => {

    app.post('/api/exists', function (req, res) {
        res.send(fs.existsSync(req.body.path));
    });

    app.post('/api/copy', function (req, res, next) {
        const from = req.body.from;
        const to = req.body.to;
        fs.writeFileSync(to, fs.readFileSync(from));
        res.send(true);
    });

    app.post('/api/read/dir', function (req, res, next) {

        const path = req.body.path;
        if (fs.existsSync(path)) {
            res.send(fs.readdirSync(path).map(file => {
                return req.body.baseName ? basename(file) : file;
            }))
        } else {
            res.send([])
        }
    });

    app.post('/api/read', function (req, res, next) {
        const path = req.body.path;

        if (fs.existsSync(path)) {
            res.send(fs.readFileSync(path, 'utf8'));
        } else {
            res.json({})
        }

    });

    app.post('/api/delete', function (req, res, next) {
        const path = req.body.path
        if (fs.existsSync(path)) {
            if (fs.lstatSync(path).isDirectory()) {
                for (const childFile of fs.readdirSync(path)) {
                    fs.unlinkSync(childFile)
                }
            } else {
                fs.unlinkSync(path)
            }
        }
        res.send(true);
    });

    app.post('/api/save', function (req, res, next) {
        const saveRequest: SaveDTO = req.body
        const parent = resolve(saveRequest.path, '..')
        if (!fs.existsSync(parent)) {
            fs.mkdirSync(parent, { recursive: true })
        }
        fs.writeFileSync(saveRequest.path, saveRequest.content, 'utf8')
        res.json(req.body);
    });
}