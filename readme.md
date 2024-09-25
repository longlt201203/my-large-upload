# My Large Upload
## Install & Run
1. Install NodeJS (> 20)
2. Clone the source code
* npm
```shell
# install dependency
npm install

# start api server
npm run start:api

# start front-end application
npm run start:front
```
* yarn
```shell
# install dependency
yarn

# start api server
yarn start:api

# start front-end application
yarn start:front
```
## How To Use?
After you start the application, go to [http://localhost:3000](http://localhost:3000) to start uploading. You can also host this app to an VPS to simulate the real environment.
### Upload Form
This is the form in which you upload your file:

![](./docs/imgs/upload-form.png)

There are 3 endpoints to test:
* `/api/upload/multer/disk` - upload file parts to `multer`'s `disk storage` endpoint.
* `/api/upload/multer/mem` - upload file parts to `multer`'s `memory storage` endpoint.
* `/api/upload/busboy` - uploading file parts to `busboy` endpoint.

`Chunk size` is the field that indicates the maximum upload file part's size. For example: the chunk size is 100MB and the file is 523MB, the file will be splited into 6 parts: 5 100MB parts and 1 23MB part.
### Server Status
There are 2 diagrams that show the status of the server: `Server RAM` and `Server CPU`:
* Server RAM diagram displays the percentage of memory that the application is using over total memory of the server.

![](./docs/imgs/server-ram.png)
* Server CPU diagram displays the percentage CPU usage of the application over server CPU.

![](./docs/imgs/server-cpu.png)
### Uploading Status
This diagram shows the current uploading measurements from client to server. 

![](./docs/imgs/uploading-status.png)

The upload form also shows you some more useful information such as avg(upload speed), avg(chunk's upload speed), time left, total progress.

![](./docs/imgs/uploading-status-upload-form.png)
### Chunk Status

![](./docs/imgs/chunk-status.png)