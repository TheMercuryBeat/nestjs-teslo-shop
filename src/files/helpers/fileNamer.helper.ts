import { Request } from "express";
import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Request, file: Express.Multer.File, callback: Function) => {

    const extensionFile = file.mimetype.split('/')[1];
    const filename = `${uuid()}.${extensionFile}`;

    callback(null, filename);
};