import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp');
    },
    filename: (req, file, cb) => {
        const fn = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, fn);
    }
});

const upload = multer({
    storage: storage,
});

export default upload;