import busboy from 'busboy';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';

const uploadsFolder = 'uploads';

export const handleFile = (req: Request, res: Response, next: NextFunction) => {
  const bb = busboy({
    headers: req.headers,
  });
  bb.on('file', (fieldName, file, info) => {
    const writter = fs.createWriteStream(`${uploadsFolder}/${info.filename}`);
    file.pipe(writter);
  });
  bb.on('field', (fieldName, val) => {
    console.log(fieldName, val);
  });
  bb.on('error', (err) => {
    console.error(err);
  });
  bb.on('finish', () => {
    next();
  });
  req.pipe(bb);
};
