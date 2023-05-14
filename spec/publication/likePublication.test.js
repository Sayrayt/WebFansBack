const { PublicationTestModule, db, server } = require('../../app');
const Publication = require('../../application/modules/PublicationManager/Publication');

describe('test publication manager wrong data responses', () => {
    test('prepare method to like publication', async () => {
        const undefinedData = await PublicationTestModule._likePublication(undefined);
        const emptyData = await PublicationTestModule._likePublication();

        expect(emptyData).toBeNull();
        expect(undefinedData).toBeNull();
    });
});

describe('test method of like publication', () => {
    const newPublication = new Publication({ id: 7, publisherId: 2, db });
    const publication = new Publication({ id: 5, publisherId: 2, db });

    test('like publication', async () => {
        const data = await newPublication.addLike();
        expect(data).toBeTruthy();
    });

    test('like already liked publication', async () => {
        const data = await publication.addLike();
        expect(data).toBeNull();
    });

    test('like non existing publication', async () => {
        const wrongPublication = new Publication({ publisherId: 2, id: 600, db });
        const nonExistingPublication = await wrongPublication.addLike();
        expect(nonExistingPublication).toBeNull();
    });

    test('like non existiing publication by non exsiting publiser', async () => {
        const wrongPublication = new Publication({ publisherId: 15, id: 670, db });
        const nonExistingPublisher = await wrongPublication.addLike();
        expect(nonExistingPublisher).toBeNull();
    });

    test('like publication by non exsiting publiser', async () => {
        const wrongPublication = new Publication({ publisherId: 65, id: 3, db });
        const nonExistingPublisher = await wrongPublication.addLike();
        expect(nonExistingPublisher).toBeNull();
    });
});

afterAll(() => {
    server.close();
});