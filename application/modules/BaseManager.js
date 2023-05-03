class BaseManager {
    constructor({ mediator, db, common, io, SOCKETS }) {
        this.mediator = mediator;
        this.TRIGGERS = mediator.getTriggerNames();
        this.EVENTS = mediator.getEventNames();
        this.db = db;
        this.common = common;
        this.io = io;
        this.SOCKETS = SOCKETS;
    }
}

module.exports = BaseManager;