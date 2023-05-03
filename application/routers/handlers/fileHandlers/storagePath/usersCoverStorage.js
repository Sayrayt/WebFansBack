const multer = require('multer');
const hash = require('object-hash');

const multerConfigCovers = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/assets/usersCover');
    },
    filename: (req, file, callback) => {
        const fileExtention = file.mimetype.split('/')[1];
        const guidHash = hash({ guid: req.body.guid, date: Date.now() });
        callback(null, `${guidHash}-cover.${fileExtention}`);
    }
});

const isImage = (req, file, callback) => {
    if(file.mimetype.startsWith('image')) {
        callback(null, true);
    }
}

const uploadCover = multer({
    storage: multerConfigCovers,
    fileFilter: isImage
});

module.exports = uploadCover;