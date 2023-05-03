function uploadFileHandler(mediator) {
    return async (req, res) => {
        const { hash, guid, random } = req.body;
        const { RECORD_USER_FILE } = mediator.TRIGGERS;
        const file = req.file;

        if(hash && random && guid && file) {
            const data = await mediator.get(RECORD_USER_FILE, { hash, guid, random, file });
            if(data) {
                //return res.send(answer.good({ data }));
            }
        }
        //return res.send(answer.bad());
    }
}

module.exports = uploadFileHandler;