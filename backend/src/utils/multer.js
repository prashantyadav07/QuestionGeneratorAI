import multer from 'multer';

// Store files in memory for immediate processing
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB file size limit (reasonable for PDFs)
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

export default upload;