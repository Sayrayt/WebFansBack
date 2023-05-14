const BaseManager = require('../BaseManager');
const Publication = require('./Publication');

class PublicationManager extends BaseManager {
    constructor(options) {
        super(options);

        // Это не домашка, и файлы ArtType и TimePeriod вам не нужны, можете в них не залазить
        // DO NOT DELETE IT!
        //this.all = new TimePeriod;
        //this.month = new TimePeriod(2592000000);    // 2592000000 milliseconds in 1 month
        //this.week = new TimePeriod(604800000);      // 604800000 milliseconds in 1 week
        //this.day = new TimePeriod(86400000);        // 86400000 milliseconds in 1 day
        // DO NOT DELETE IT!

        this.publications = new Map();

        ////sockets
        if(!this.io) return;

        const {
            ADD_PUBLICATION,
            EDIT_PUBLICATION,
            DELETE_PUBLICATION,
            ADD_LIKE,
            REMOVE_LIKE,
            GET_USER_PUBLICATIONS,
            GET_PUBLICATION,
            GET_LIKED_USER_PUBLICATIONS,
            ADD_COMMENT,
            EDIT_COMMENT,
            DELETE_COMMENT, 
        } = this.SOCKETS;

        this.io.on('connection', (socket) => {
            socket.on(ADD_PUBLICATION,              (data) => _addPublication(data, socket));
            socket.on(EDIT_PUBLICATION,             (data) => _method(data, socket));
            socket.on(DELETE_PUBLICATION,           (data) => _method(data, socket));
            socket.on(ADD_LIKE,                     (data) => _likePublication(data, socket));
            socket.on(REMOVE_LIKE,                  (data) => _removePublicationLike(data, socket));
            socket.on(GET_USER_PUBLICATIONS,        (data) => _method(data, socket));
            socket.on(GET_PUBLICATION,              (data) => _method(data, socket));
            socket.on(GET_LIKED_USER_PUBLICATIONS,  (data) => _method(data, socket));
            socket.on(ADD_COMMENT,                  (data) => _method(data, socket));
            socket.on(EDIT_COMMENT,                 (data) => _method(data, socket));
            socket.on(DELETE_COMMENT,               (data) => _method(data, socket));
        });

        //mediator
    }

    _addPublication({ title, image, description, tags, guid, hash, random }, socket) {
        const params = { title, image, description, tags, guid };
        const user = this._getUser({ guid, hash, random, params });
        if(user) {
            const newPublication = new Publication({ 
                publisherId: user.id,
                db: this.db 
            });
            const isAdded = newPublication.add();
            if(isAdded) {
                this.publications.set(newPublication.id, newPublication);
                socket.emit(this.SOCKETS.ADD_PUBLICATION, true);
                return;
            }
        }
        socket.emit(this.SOCKETS.ADD_PUBLICATION, false);
    }

    _method() {}

    async _likePublication({ publicationId, publisherId, guid, hash, random } = {}, socket) {
        const params = { publicationId, publisherId, guid };
        const user = this._getUser({ guid, hash, random, params });
        if(user && publicationId) {
            const newPublication = new Publication({ publicationId, publisherId, db });
            const isLiked = await newPublication.addLike();
            socket ? socket.emit(this.SOCKETS.ADD_LIKE, isLiked) : '';
            return;
        }
        socket ? socket.emit(this.SOCKETS.ADD_LIKE, null) : '';
        return null;
    }

    async _removePublicationLike({ publicationId, guid, hash, random } = {}, socket) {
        const params = { publicationId, guid };
        const user = this._getUser({ guid, hash, random, params });
        if(user && publicationId) {
            const newPublication = new Publication({ publicationId, publisherId, db });
            const isRemoved = await newPublication.removeLike();
            socket ? socket.emit(this.SOCKETS.REMOVE_LIKE, isRemoved) : '';
            return;
        }
        socket ? socket.emit(this.SOCKETS.REMOVE_LIKE, null) : '';
        return null;
    }

    _getUser(data) {
        return this.mediator.get(this.TRIGGERS.INNER_GET_USER, data);
    }
}

module.exports = PublicationManager;