const multer = require('multer');
const hash = require('object-hash');

const multerConfigAvatars = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/assets/usersAvatar');
    },
    filename: (req, file, callback) => {
        const fileExtention = file.mimetype.split('/')[1];
        const guidHash = hash({ guid: req.body.guid, date: Date.now() });
        callback(null, `${guidHash}-avatar.${fileExtention}`);
    }
});

const isImage = (req, file, callback) => {
    if(file.mimetype.startsWith('image')) {
        callback(null, true);
    }
}

const uploadAvatar = multer({
    storage: multerConfigAvatars,
    fileFilter: isImage
});

module.exports = uploadAvatar;