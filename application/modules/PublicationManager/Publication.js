const BaseEntity = require('../BaseEntity');

class Publication extends BaseEntity {
    constructor({ soketId,  ...options }) {
        super(options);

        this.id;
        this.comment_id;
        this.liker_id;
        this.post_id;
        
    }

}



module.exports = Publication;