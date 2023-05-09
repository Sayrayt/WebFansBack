function likeHandler(mediator) {
    return async (req, res) => {
        //const { comment_id, liker_id, post_id } = req.body;
        const { like_id} = req.body;
        const { LIKE_POST_HANDLER } = mediator.TRIGGERS;
        
            //const data = await mediator.get(LIKE_POST_HANDLER, { comment_id, liker_id, post_id });
            const data = await mediator.get(LIKE_POST_HANDLER, { like_id });
            
            if(data) {
                return res.send( data );
            }
        
    }
}

module.exports = likeHandler;