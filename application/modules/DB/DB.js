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
        if(!user[0]) {
            const [ { id } ] = await this.orm.insert('users', { login, password, name, guid }, [ 'id' ]);    // create new user
            if(id) {
                const isCreated = await this.orm.insert('options', { user_id: id });                         // create options for this user
                if(isCreated) { return true };
            }
        }
        return null;
    } 

    async login(login, password, token) {
        const user = (await this.orm.update('users', { token }, { login, password }, ['*']))[0];          // update token and return user data
        if(user) {
            const userOptions = (await this.orm.select('options', 'avatar_title, cover_title', { user_id: user.id }))[0]; // get user optonal data
            return { ...user, ...userOptions };
        }
    }

    logout(guid) {
        return this.orm.update('users', { token: null }, { guid });
    }

    async getUserByGuid(guid) {
        const query = `
            SELECT users.*, o.avatar_title, o.cover_title
            FROM users, options AS o
            WHERE users.id = o.user_id AND guid = $1
        `;
        let response = null;
        try { response = (await this.db.query(query, [guid]))?.rows; } 
        catch (e) { console.log('error:', e) };
        return response;
    }

    /************/
    /**  chat  **/
    /************/

    recordMessage({ message, senderId, recipientId=null }) {
        return this.orm.insert('messages', { message, sender_id: senderId, recipient_id: recipientId, date: Date.now() }, ['id']);
    }

    editMessage({ message, id }) {
        return this.orm.update('messages', { message }, { id });
    }

    async getStorageMessages(offSet = 0, limit  = 40) {
        const query = `
            SELECT * FROM messages WHERE recipient_id IS NULL
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offSet}
        `;
        let response = null;
        try { response = (await this.db.query(query))?.rows; }
        catch (e) { console.log('error:', e) };
        return response;
    }

    async getPrivateMessages(senderId, recipientId, limit = 40, offSet=0) {
        const query = `
            SELECT * FROM messages
            WHERE (sender_id = ${senderId} AND recipient_id = ${recipientId}) OR (recipient_id = ${recipientId} AND sender_id = ${senderId})
            ORDER BY id
            LIMIT ${limit} OFFSET ${offSet}
        `;
        let response = null;
        try { response = (await this.db.query(query))?.rows; }
        catch (e) { console.log('error:', e) };
        return response;
    }

    async getLastPrivateMessages(id, limit = 10) {
        //const query = `
        //    SELECT max(m.id) AS id, m.message, m.sender_id, m.recipient_id, u.guid, u.name, o.avatar_title
        //    FROM messages AS m, users AS u, options AS o
        //    WHERE (sender_id=${id} OR recipient_id=${id}) AND (m.recipient_id = u.id AND u.id <> ${id} OR m.sender_id = u.id) AND m.recipient_id IS NOT NULL
        //    GROUP BY m.recipient_id + m.sender_id
        //    ORDER BY id DESC
        //    LIMIT ${limit}
        //`;
        //let response = null;
        //try { response = await this.db.query(query); }
        //catch (e) { console.log('error:', e) };
        //return response;
    }

    /************/
    /**  file  **/
    /************/

    async recordImageTitle(userId, type, title) {
        return this.orm.update('options', { [`${type}Title`]: title }, { userId });
    }

    /****************/
    /**  homework  **/
    /****************/

    //создать публикацию
    addPublication(publisherId, title, image, description, date) {
        return this.orm.insert('publications', { publisher_id: publisherId, title, image, description, date });
    }

    //изменить публикацию
    async editPublication(id, editedData) {
        return this.orm.update('publications', editedData, { publisher_id: id });
    }

    //Поставить/снять лайк
    async likePublication(publicationId, userId) {
        this.orm.insert('likes', { liker_id: userId, post_id: publicationId });
        this.orm.update('publications', { likes: 'publications.likes + 1' }, { id });
    }
    async removePublicationLike(publicationId, userId) {
        const like = await this.orm.select('likes', 'id', { post_id: publicationId, liker_id: userId });
        if(like) {
            this.orm.delete('likes', { liker_id: userId, post_id: publicationId });
            this.orm.update('publications', { likes: 'publications.likes - 1' }, { id });
        }
    }

    //получить публикации юзера
    async getUserPublications(id) {
        return this.orm.select('publications', '*', { publisher_id: id });
    }

    //получить лайкнутые публикации
    async getLikedPublications(id) {
        const query = `
            SELECT p.id, p.publisher_id, p.title, p.image, p.likes, p.views, p.comments, p.description, p.tags, p.date
            FROM 
                publications AS p INNER JOIN likes AS l
                ON l.post_id = p.id
            WHERE l.liker_id = ${id}
        `;
        let response = null;
        try { response = (await this.db.query(query))?.rows; }
        catch (e) { console.log('error:', e) };
        return response;
    }

    //добавить комент к записи
    async addPublicationComment(commentator_id, publication_id, comment, date) {
        this.orm.insert('comments', { commentator_id, publication_id, comment, date });
        this.orm.update('publications', { comments: 'publications.comments + 1' }, { publication_id });
    }

    //изменть комент
    async editPublicationComment(commentator_id, publication_id, editedComment) {
        this.orm.update('comments', { comment: editedComment }, { commentator_id, publication_id, });
    }

    //удалить пуликацию/лайк/комент/юзера
    async deletePublication(id) {
        this.orm.delete('publications', { id })
    }
    async removePublicationLike(publicationId, userId) {
        const like = await this.orm.select('likes', 'id', { post_id: publicationId, liker_id: userId });
        if(like) {
            this.orm.delete('likes', { liker_id: userId, post_id: publicationId });
            this.orm.update('publications', { likes: 'publications.likes - 1' }, { id });
        }
    }
    async deleteComment(id) {
        this.orm.delete('comments', { id });
    }
    async deleteUser() {
        this.orm.delete('users', { id });
    }
}

module.exports = DB;