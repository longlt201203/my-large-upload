import multer, { diskStorage, memoryStorage } from 'multer';

const uploadFolder = 'uploads';

const diskStore = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const memStore = memoryStorage();

export const uploadDisk = multer({ storage: diskStore });
export const uploadMem = multer({ storage: memStore });