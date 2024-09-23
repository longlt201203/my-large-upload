import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { upload } from './multer';
import { handleFile } from './busboy';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import { Server as SocketServer } from 'socket.io';
import { SocketSingleton } from 'api-cluster/src/socket';

function main() {
  const app = express();

  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  app.post('/api/upload/multer', upload.single('chunk'), (req, res) => {
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
}

if (cluster.isPrimary) {
  const uploadsFolder = 'uploads';
  if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder);

  const numProcesses = availableParallelism();
  for (let i = 0; i < numProcesses; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  main();
}
