const BaseEntity = require("../BaseEntity");

class Publication extends BaseEntity {
    constructor({ publisherId = null, userId = null, ...options }) {
        super(options);

        this.id;
        this.publisherId = publisherId;
        this.userId = userId;
        this.title;
        this.image;
        this.description;
        this.date = Date.now();
        this.raito = 0;

        this.comments = new Map();

        this.likes = 0;
        this.bookmarks = 0;
    }

    async add(title, image, description) {
        const recordedInfo = await this.db.addPublication(this.publisherId, title, image, description, this.date);
        if (recordedInfo) {
            this.id = recordedInfo.id;
            this.title = title;
            this.image = image;
            this.description = description;
            return true;
        }
        return null;
    }

    edit() { }

    delete() { }

    async addLike() {
        const answer = await this.db.likePublication(this.id, this.userId);
        return answer ? true : null;
    }

    async removeLike() { 
        const answer = await this.db.removeLike(this.id, this.userId);
        return answer ? true : null;
    }

    addComment() { }

    editCommnet() { }

    deleteComment() { }

    get() { }

    _mathRaito() { }
}

module.exports = Publication;