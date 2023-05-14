const BaseEntity = require('../BaseEntity');

class User extends BaseEntity {
    constructor({ soketId, ...options }) {
        super(options);
        
        this.id;
        this.token;
        this.guid;
        this.password;
        this.login;
        this.name;
        this.avatarTitle;
        this.coverTitle;
        
        this.socketId = soketId;
    }

    /**  outer functions **/

    registration({ login, password, name, guid }) {
        if(login && password && name && guid) {
            const passwordHash = this.common.encryptData({ login, password }).hashedParams; // get password in hash state
            return this.db.recordUser({ login, password: passwordHash, name, guid });
        }
        return null;
    }

    async loginUser({ login, password, random }) {
        if(login && password && random) {
            const originPassword = password.slice(0, -random.length); // get hashed password without random ending
            const hash = this.common.encryptData({ login, password: originPassword }); // get hashed token and random number
            const user = await this.db.login(login, originPassword, hash.token);
            if(user) {
                this._recordUserInfo(user);
                return { 
                    random: hash.random, 
                    user: this._innerGet()
                };
            }
        }
        return { random: null, user: null };
    }

    async autoLogin({ hash, random, guid }) {
        const user = (await this.db.getUserByGuid(guid))[0];
        if(user) {
            this._recordUserInfo(user);
            const checkUser = this.get({ hash, random, params: { guid } });
            if(checkUser) { return checkUser };
        }
        return null;
    }

    logout({ hash, random }) {
        const isAproved = this._filterHashedData({ 
            hash, 
            random, 
            params: { guid: this.guid }, 
        });
        if (isAproved) { return this.db.logout(this.guid) };
        return false;
    }

    get(data) {
        const isAproved = this._filterHashedData(data);
        if (isAproved) { 
            return {
                id: this?.id,
                guid: this?.guid,
                name: this?.name,
                coverTitle: this?.coverTitle,
                avatarTitle: this?.avatarTitle,
            }
        };
        return null;
    }

    /** inner functions **/

    _recordUserInfo(userData = {}) {
        if(userData) {
            this.id = userData.id;
            this.guid = userData.guid;
            this.token = userData.token;
            this.login = userData.login;
            this.password = userData.password;
            this.name = userData.name;
            this.coverTitle = userData.avatar_title;
            this.avatarTitle = userData.cover_title;
        }
    }

    _innerGet() {
        return {
            id: this?.id,
            guid: this?.guid,
            name: this?.name,
            coverTitle: this?.coverTitle,
            avatarTitle: this?.avatarTitle,
        }
    }

    _filterHashedData({ hash, random, params }) {
        const possibleHash = this.common.encryptData(params, { random, token: this.token }).hash;
        return(possibleHash === hash);
    }
}

module.exports = User;