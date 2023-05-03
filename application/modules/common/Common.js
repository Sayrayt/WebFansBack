const Security = require('./Security');
class Common {
    constructor() {
        this.security = new Security;
    }

    encryptData(params={}, options={ random:null, token:null }) {
        return this.security.encryptData(params, options);
    }
}

module.exports = Common;