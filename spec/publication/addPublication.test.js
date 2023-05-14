//const { PublicationTestModule } = require('../../app');

const Publication = require('../../application/modules/PublicationManager/Publication')
const publication = new Publication(2,1);

test('add Publication', () => {
    expect(publication.addLike(2,1).toBe(0))
});