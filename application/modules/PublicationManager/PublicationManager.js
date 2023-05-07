const BaseManager = require('../BaseManager');
const Publication = require('./Publication');

class PublicationManager extends BaseManager {
    constructor(options) {
        super(options);

        const {
            LIKE_POST_HANDLER,
        } = this.TRIGGERS;

        this.mediator.set(LIKE_POST_HANDLER, (params) => this.like(params));
 
    }

    like({ like_id = 1,comment_id, liker_id, post_id }) {
        if (post_id && liker_id && comment_id) {
            //const dbDate = this.db.getLikes();

        }
        const dbDate = this.db.getLikes(1);
        return dbDate;
    }
}



module.exports = PublicationManager;