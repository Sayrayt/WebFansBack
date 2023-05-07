const express = require("express");
const router = express.Router();

//file
const uploadAvatar = require('./handlers/fileHandlers/storagePath/usersAvatarStorage');
const uploadCover = require('./handlers/fileHandlers/storagePath/usersCoverStorage');
const uploadFileHandler = require('./handlers/fileHandlers/uploadFileHandler');
const likeHandler = require('./handlers/publicationHandler/likeHandler');


function Router({ mediator }) {
    /// File ///
    router.post('/api/uploadAvatar', uploadAvatar.single('image'), uploadFileHandler(mediator));
    router.post('/api/uploadCover', uploadCover.single('image'), uploadFileHandler(mediator));
    // Publications //
    router.get('/api/like', likeHandler(mediator));
    return router;
}

module.exports = Router;