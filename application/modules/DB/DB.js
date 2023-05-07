const { query } = require('express');
const ORM = require('./ORM');
const { Client } = require('pg');

class DB {
    constructor({ HOST, PORT, NAME, USER, PASS, initCB = () => null }) {
        this.db;
        this.orm;
        this.db = new Client({
            host: HOST,
            port: PORT,
            database: NAME,
            user: USER,
            password: PASS
        });

        (async () => {
            await this.db.connect();
            this.orm = new ORM(this.db);
            initCB();
        })();
    }

    destructor() {
        if (this.db) {
            this.db.end();
            this.db = null;
        }
    }

    /************/
    /**  user  **/
    /************/

    async recordUser({ login, password, name, guid }) {
        const user = await this.orm.select('users', 'login', { login });                                     // chec if user alredy exist
        if (!user[0]) {
            const [{ id }] = await this.orm.insert('users', { login, password, name, guid }, ['id']);    // create new user
            if (id) {
                const isCreated = await this.orm.insert('options', { user_id: id });                         // create options for this user
                if (isCreated) { return true };
            }
        }
        return null;
    }

    async login(login, password, token) {
        const dbAnswer = await this.orm.update('users', { token }, { login, password });            // update token
        if (dbAnswer) {
            const query = this._getUserInfoQuery('AND login=? AND password=?');                     // create query with special conditions `bout user
            return new Promise((resolve) => {
                this.db.select(query, [login, password], (error, row) => resolve(error ? null : row)); // get all the info `bout user
            });
        }
        return null;
    }

    logout(guid) {
        return this.orm.update('users', { token: null }, { guid });
    }

    getUserByGuid(guid) {
        const query = this._getUserInfoQuery('AND guid=?');             //create query with special conditions `bout user
        return new Promise((resolve) => {
            //this.db.get(query, guid, (error, row) => resolve(error ? null : row));
        });
    }

    /************/
    /**  chat  **/
    /************/

    recordMessage({ message, senderId, recipientId = null }) {
        return this.orm.insert('messages', { message, senderId, recipientId });
    }

    editMessage({ message, id }) {
        return this.orm.update('messages', { message }, { id });
    }

    getLastMessages() {
        const query = this._getMessagesQuery();
        return new Promise((resolve) => {
            //this.db.all(query, (error, rows) => resolve(error ? null : rows));
        });
    }

    getStorageMessages(offSet) {
        const query = this._getMessagesQuery(offSet);
        return new Promise((resolve) => {
            //this.db.all(query, (error, rows) => resolve(error ? null : rows));
        });
    }

    getPrivateMessages(offSet = 0) {
        const query = `
            SELECT * FROM messages
            WHERE (senderId = 1 AND recipientId = 2) OR (recipientId = 1 AND senderId = 2)
            ORDER BY id
            LIMIT 40 OFFSET ${offSet}
        `;
        return new Promise((resolve) => {
            //this.db.all(query, (error, rows) => resolve(error ? null : rows));
        });
    }

    getLastPrivateMessages(id, limit = 7) {
        const query = `
            SELECT max(m.id) AS id, m.message, m.senderId, m.recipientId, u.guid, u.name, o.avatarTitle
            FROM messages AS m, users AS u, usersOptions AS o
            WHERE (senderId=${id} OR recipientId=${id}) AND (m.recipientId = u.id AND u.id <> ${id} OR m.senderId = u.id) AND m.recipientId IS NOT NULL
            GROUP BY m.recipientId + m.senderId
            ORDER BY id DESC
            LIMIT ${limit}
        `;
        return new Promise((resolve) => {
            //this.db.all(query, (error, rows) => resolve(error ? null : rows));
        });
    }

    /************/
    /**  file  **/
    /************/

    async recordImageTitle(userId, type, title) {
        return this.orm.update('usersOptions', { [`${type}Title`]: title }, { userId });
    }

    /** inner functions **/

    _getUserInfoQuery(ending = '') {
        return `
            SELECT users.*, o.avatarTitle, o.coverTitle 
            FROM users, usersOptions AS o
            WHERE users.id = o.userId ${ending}
        `;
    }

    _getMessagesQuery(offSet = 0) {
        return `
            SELECT * FROM messages WHERE recipientId IS NULL
            ORDER BY id DESC
            LIMIT 40 OFFSET ${offSet}
        `;
    }

    /********************/
    /**  Publications  **/
    /********************/
    getLikes(like_id){
        const query = `select * from likes where like_id = ${like_id}`;
        return query;
    }
    
    like(liker_id, post_id, comment_id) {
        const query = this.orm.insert('likes', { liker_id, post_id, comment_id });
        return query;
    }
}

module.exports = DB;