const BaseManager = require('../BaseManager');
const User = require('./User');

class UserManager extends BaseManager {
    constructor(options) {
        super(options);

        this.users = new Map();

        ////sockets
        if(!this.io) return;

        const {
            REGISTRATION,
            LOGIN,
            LOGOUT,
            AUTO_LOGIN
        } = this.SOCKETS;

        this.io.on('connection', (socket) => {
            socket.on(REGISTRATION, (data) => this._registration(data, socket));
            socket.on(LOGIN, (data) => this._login(data, socket));
            socket.on(AUTO_LOGIN, (data) => this._autoLogin(data, socket));
            socket.on(LOGOUT, (data) => this._logout(data, socket));

            socket.on('disconnect', () => this._softLogout(socket));
        });

        //mediator
        this.mediator.set(this.TRIGGERS.INNER_GET_USER, (data) => this.getUser(data));
        this.mediator.set(this.TRIGGERS.INNER_GET_USERS, () => this.getUsers());
    }

    getUser({ guid, hash, random, params }) {
        const user = this.users.get(guid);
        return (user ? user.get({ hash, random, params }) : null);
    }

    getUsers() {
        return this.users;
    }

    async _registration(data={}, socket) {
        const newUser = new User({
            db: this.db,
            common: this.common
        });
        if(await newUser.registration(data)) {
            socket.emit(this.SOCKETS.REGISTRATION, true);
            return;
        }
        socket.emit(this.SOCKETS.REGISTRATION, false);
    }

    async _login(data={}, socket) {
        const newUser = new User({
            db: this.db,
            common: this.common,
            soketId: socket.id
        });
        const { random, user } = await newUser.loginUser(data);
        if(random) {
            const guid = newUser?.guid;
            this.users.set(guid, newUser);
            socket.emit(this.SOCKETS.LOGIN, { random, guid, user });       // return random number that was used to create hash and user`s guid
            return;
        }
        socket.emit(this.SOCKETS.LOGIN, null);
    }

    async _autoLogin(data={}, socket) {
        if(data) {
            const newUser = new User({
                db: this.db,
                common: this.common,
                soketId: socket.id
            });
            const user = await newUser.autoLogin(data);
            if(user) {
                this.users.set(data.guid, newUser)
                socket.emit(this.SOCKETS.AUTO_LOGIN, user);
                return;
            }
        }
        socket.emit(this.SOCKETS.AUTO_LOGIN, null);
    }

    async _logout({ hash, guid, random }, socket) {
        if(hash && guid && random) {
            const user = this.users.get(guid);              // chek if user is existing and get it
            if(user) {
                if(await user.logout({ hash, random })) {   // check if success logout
                    this.users.delete(guid);
                    socket.emit(this.SOCKETS.LOGOUT, true);
                    this.mediator.call(this.EVENTS.ON_USER_LOGOUT, socket.id);
                    return;
                }
            }
        }
        socket.emit(this.SOCKETS.LOGOUT, false);
    }

    _softLogout(socket) {
        for(let user of this.users.values()) {
            if(user.socketId === socket.id) {
                this.users.delete(user.guid);
                this.mediator.call(this.EVENTS.ON_USER_LOGOUT, socket.id);
                break;
            }
        }
    }
}

module.exports = UserManager;