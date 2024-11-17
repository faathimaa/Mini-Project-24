const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder where images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
// const expectedFieldName = 'image'; // Replace with your actual expected field name

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    // if (file.fieldname !== expectedFieldName) {
    //     return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    // }
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
