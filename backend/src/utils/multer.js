import multer from 'multer';

// Files ko memory mein store karenge taaki unhe seedha buffer se process kiya ja sake
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 50 MB file size limit
    }
});

export default upload;