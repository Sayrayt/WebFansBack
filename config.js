class CONFIG {
    PORT = 3001;

    DB_CONFIG = {
        HOST: 'localhost',
        PORT: 5432,
        NAME: 'webfans',
        USER: 'postgres',
        PASS: '123'
    }

    SOCKETS = {
        /** user **/
        REGISTRATION: 'REGISTRATION',
        LOGIN: 'LOGIN',
        LOGOUT: 'LOGOUT',
        AUTO_LOGIN: 'AUTO_LOGIN',
        /** chat **/
        SEND_MESSAGE: 'SEND_MESSAGE',
        NEW_MESSAGE: 'NEW_MESSAGE',
        GET_CACHED_MESSAGES: 'GET_CACHED_MESSAGES',
        GET_STORAGE_MESSAGES: 'GET_STORAGE_MESSAGES',
        EDIT_MESSAGE: 'EDIT_MESSAGE',
        GET_EDITED_MESSAGE: 'GET_EDITED_MESSAGE',
        GET_LAST_PRIVATE_MESSAGES: 'GET_LAST_PRIVATE_MESSAGES',
        JOIN_PRIVATE_ROOM: 'JOIN_PRIVATE_ROOM',
        GET_STORAGE_PRIVATE_MESSAGES: 'GET_STORAGE_PRIVATE_MESSAGES' 
    }

    MEDIATOR = {
        EVENTS: {
            ON_USER_LOGOUT: 'ON_USER_LOGOUT',
            ON_DATABASE_INIT: 'ON_DATABASE_INIT' 
        },
        TRIGGERS: {
            /**  users  **/
            INNER_GET_USER: 'INNER_GET_USER',
            INNER_GET_USERS: 'INNER_GET_USERS',
            /**  chat  **/
            GET_MESSAGES_HANDLER: 'GET_MESSAGES_HANDLER',
            SEND_PRIVATE_MESSAGE_HANDLER: 'SEND_PRIVATE_MESSAGE_HANDLER',
            SEND_PUBLIC_MESSAGE_HANDLER: 'SEND_PUBLIC_MESSAGE_HANDLER',
            /**  files  **/
            RECORD_USER_FILE: 'RECORD_USER_FILE',
        }
    }
}

module.exports = new CONFIG();