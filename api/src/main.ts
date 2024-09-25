import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { uploadDisk, uploadMem } from './multer';
import { handleFile } from './busboy';
import { SocketSingleton } from 'api/src/socket';
import { getServerStatusHandler } from 'api/src/status';

const uploadsFolder = 'uploads';
if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder);

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/status', getServerStatusHandler);

app.post('/api/upload/multer/disk', uploadDisk.single('chunk'), (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/upload/multer/mem', uploadMem.single('chunk'), (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/upload/busboy', handleFile, (req, res) => {
  res.status(200).send('OK');
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

SocketSingleton.init(server);

server.on('error', console.error);
