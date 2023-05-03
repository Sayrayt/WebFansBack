const BaseManager = require('../BaseManager');
const Publication = require('./Publication');

class PublicationManager extends BaseManager {
    constructor(options) {
        super(options);
 
    }

    like({ comment_id, liker_id, post_id }) {
        if (post_id && liker_id && comment_id) {
            const dbDate = this.db.getLikes();

        }
        
        return 'error';
    }
}



module.exports = PublicationManager;