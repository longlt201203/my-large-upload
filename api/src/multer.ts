import multer, { diskStorage } from 'multer';

const uploadFolder = 'uploads';

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
