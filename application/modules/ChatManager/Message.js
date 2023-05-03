class Message {
    constructor({ id, message, senderId, recipientId=null }) {
        this.id = id;
        this.message = message;
        this.senderId = senderId;
        this.recipientId = recipientId;
    }
}

module.exports = Message;