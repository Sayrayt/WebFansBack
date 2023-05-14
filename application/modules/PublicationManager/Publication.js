const BaseEntity = require('../BaseEntity');

class Publication extends BaseEntity {
    constructor({...options}) {
        super(options);

        this.id = id;
        this.comment_id = comment_id;
        this.liker_id = liker_id;
        this.post_id = post_id;
        this.like_id = like_id;
        this.soketId = soketId;
        
    }

}



module.exports = Publication;