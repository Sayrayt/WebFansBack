const PublicationManager = require('../application/modules/PublicationManager/PublicationManager');

const publicationManager = new PublicationManager();

test('like',()=>{
    expect(publicationManager.like(1,1,1).toBe('error'));
})