const BaseManager = require('../BaseManager');

class FileManager extends BaseManager {
    constructor(options) {
        super(options);

        const {
            RECORD_USER_FILE,
        } = this.TRIGGERS;

        this.mediator.set(RECORD_USER_FILE, (params) => this.recordFile(params));
    }

    recordFile({ hash, guid, random, file }) {
        const user = this.getUserByGuid(hash, guid, random);
        if(user) { 
            this.fileRecord.recordFile(file, user);
            return;
        }
        this.deleteFile(file.path);
    }

    /**  inner functions  **/

    getUserByGuid(hash, guid, random, params={}) {
        return this.mediator.get(this.TRIGGERS['GET_USER_BY_GUID_HANDLER'], { hash, guid, random, params });
    }
}

module.exports = FileManager;