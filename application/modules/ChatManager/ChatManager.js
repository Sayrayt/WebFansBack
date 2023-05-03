const BaseManager = require('../BaseManager');
const Message = require('./Message');

class ChatManager extends BaseManager {
    constructor(options) {
        super(options);
        
        this.messages = new Map();
        this.rooms = new Map();

        //sockets
        if(!this.io) return;
        const { 
            SEND_MESSAGE, 
            GET_CACHED_MESSAGES,
            EDIT_MESSAGE,
            GET_STORAGE_MESSAGES,
            JOIN_PRIVATE_ROOM,
            GET_STORAGE_PRIVATE_MESSAGES, 
            GET_LAST_PRIVATE_MESSAGES
        } = this.SOCKETS;

        this.io.on('connection', (socket) => {
            socket.on(SEND_MESSAGE,                 (data) => this._recordMessage(data, socket));
            socket.on(GET_STORAGE_MESSAGES,         (data) => this._getNewMessages(data, socket));
            socket.on(EDIT_MESSAGE,                 (data) => this._editMessage(data, socket));
            socket.on(GET_LAST_PRIVATE_MESSAGES,    (data) => this._getLastPrivareMessages(data, socket));
            socket.on(JOIN_PRIVATE_ROOM,            (data) => this._joinRoom(data, socket));
            socket.on(GET_STORAGE_PRIVATE_MESSAGES, (data) => this._getPrivateMessages(data, socket));

            socket.emit(GET_CACHED_MESSAGES, this.messages);
        });

        this.mediator.subscribe(this.EVENTS.ON_DATABASE_INIT, () => this._onDatabaseInit());      // get last messages on server`s embark
        this.mediator.subscribe(this.EVENTS.ON_USER_LOGOUT, () => this._clearRooms());
    }

    /**  outer functions  **/

    async _recordMessage({ hash, random, guid, message }, socket) {
        const params = { guid, message };
        const sender = this._getUser({ guid, hash, random, params });            // check if token hash matched with params and get according user
        if(sender) {
            const id = await this.db.recordMessage({ message: jsonMessage, senderId: sender?.id });         // record new message to DB and get it`s id
            if(id) {
                const newMessage = new Message({ id, message, senderId: sender?.id });
                this.messages.set(id, newMessage);
                if(this.messages.size >= 40) { 
                    const firstElem = this.messages.keys().next().value;     // get id of first elem
                    this.messages.delete(firstElem)                          // delete this elem
                };
                this.io.emit(this.SOCKETS.NEW_MESSAGE, newMessage);
                socket.emit(this.SOCKETS.SEND_MESSAGE, true);
                return;
            }
        }
        socket.emit(this.SOCKETS.SEND_MESSAGE, false);
    }

    async _getNewMessages({ hash, random, guid, offSet }, socket) {
        const params = { guid, offSet };
        const sender = this._getUser({ guid, hash, random, params });            // check if token hash matched with params and get according user
        if(sender) {
            const recivedMessages = await this.db.getStorageMessages(offSet);
            if(recivedMessages) {
                const messages = Object.values(recivedMessages).reduce((acc, message) => {
                    acc[message.id] = message;
                    return acc;
                }, {});
                socket.emit(this.SOCKETS.GET_STORAGE_MESSAGES, messages);
                return;
            }
        }
        socket.emit(this.SOCKETS.GET_STORAGE_MESSAGES, null);
    }

    async _editMessage({ hash, random, guid, message, id }, socket) {
        const params = { guid, message, id };
        const sender = this._getUser({ guid, hash, random, params });
        if(sender) {
            const editedMessage = await this.db.editMessage({ message, id });
            if(editedMessage) {
                const newMessage = new Message({ id, message, senderId: sender?.id });
                if(this.messages.get(id)) {
                    this.messages.set(id, newMessage);
                }
                this.io.emit(this.SOCKETS.GET_EDITED_MESSAGE, newMessage);
                socket.emit(this.SOCKETS.EDIT_MESSAGE, newMessage);
                return;
            }
        }
        socket.emit(this.SOCKETS.EDIT_MESSAGE, null);
    }

    async _getLastPrivareMessages({ hash, random, guid }, socket) {
        const sender = this._getUser({ guid, hash, random, params: { guid } });
        const id = sender?.id;
        if(id) {
            const lastMessages = await this.db.getLastPrivateMessages(id);
            socket.emit(this.SOCKETS.GET_LAST_PRIVATE_MESSAGES, lastMessages);
        }
        socket.emit(this.SOCKETS.GET_LAST_PRIVATE_MESSAGES, null);
    }

    async _joinRoom({ hash, random, guid, recipientGuid }, socket) {
        const params = { guid, recipientGuid };                                 // check if user is valid
        const user = this._getUser({ guid, hash, random, params });
        if(user) {
            let room;
            if (this.messages.has(`${guid}-${recipientGuid}`)) {                // check if room already exist
                room = `${guid}-${recipientGuid}`;
            } else if(this.messages.has(`${recipientGuid}-${guid}`)) {
                room = `${recipientGuid}-${guid}`;
            }
            if(!room) { 
                const messages = await this.db.getPrivateMessages();            // get private messages
                if(messages) {
                    this.messages.set(`${guid}-${recipientGuid}`, messages);    // if room doesn`t exist then create it
                } else { 
                    socket.emit(this.SOCKETS.JOIN_PRIVATE_ROOM, null);
                    return;
                }
            };
            socket.join(room);                                                 // join in room
            const messages = this.messages.get(room);
            this.io.to(room).emit({ messages, room });                         // send messages to room and also room name
            socket.emit(this.SOCKETS.JOIN_PRIVATE_ROOM, true);
        }
        socket.emit(this.SOCKETS.JOIN_PRIVATE_ROOM, null);
    }

    async _getPrivateMessages({ hash, random, guid, recipientGuid, offSet, roomName }, socket) {
        const params = { guid, recipientGuid, offSet, roomName };               // check if user is valid
        const user = this._getUser({ guid, hash, random, params });
        if(user) {
            const messages = await this.db.getPrivateMessages(offSet);          // get private messages
            if(messages) {
                this.io.to(room).emit(messages);
                socket.emit('', true);
            }
        }
        socket.emit('', false);
    }

    /**  inner manager functions  **/

    async _onDatabaseInit() {
        (await this.db.getLastMessages())
            .forEach(message => 
                this.messages.set(message?.id, new Message(message))
            );
        return;
    }

    _clearRooms(socketId) {
        const users = this._getUsers();
        const user = Array.from(users).find(user => user.socketId === socketId);     // find user
        if(user) {
            const roomsKeys = Array.from(this.messages.keys());             // get key of every room that looks like "guid1-guid2"
            roomsKeys.forEach((roomKey) => {
                const roomParticipants = roomKey.split('-');                            // split it to find partisipants guid
                const index = roomParticipants.findIndex(user.guid);                    // exclude logouted user guid
                if (index === 0 && !users[roomParticipants[1]]) {
                    this.messages.delete(roomKey);
                } else if (index === 1 && !users[roomParticipants[0]]) {
                    this.messages.delete(roomKey);
                }
            });
        }
    }

    _getUser(data) {
        return this.mediator.get(this.TRIGGERS.INNER_GET_USER, data);
    }

    _getUsers() {
        return this.mediator.get(this.TRIGGERS.INNER_GET_USERS, '');
    }
}

module.exports = ChatManager;