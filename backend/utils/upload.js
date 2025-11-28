import multer from 'multer';
import path from 'path';

//set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null,Date.now() + "_" + file.originalname);
    }
});

//file filter
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png' , 'image/webp'];
    if(allowed.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error(" Only image files are allowed!"), false);
    }
};

export const upload = multer({ storage, fileFilter });