class BaseEntity {
    constructor({ db, common }) {
        this.db = db;
        this.common = common;
    }
}

module.exports = BaseEntity;