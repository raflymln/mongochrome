const { connection, connect } = require('mongoose');
const { Collection } = require('./structures/Constant');
const Database = require('./Database');

module.exports = {
    Collection,
    Connect: (connectURL, connectOptions, options) => {

        connect(connectURL, connectOptions);
        connection.on('error', (err) => options.onError(err));
        connection.once('open', () => {

            options.onOpen();
            connection.db.listCollections().toArray((err, collections) => {
                if (err) throw new Error(err);

                collections.map(async x => {
                    const db = new Database(x.name);
                    await db.syncData();
                });

                ready = true;
            });

        });

        return (name) => new Database(name);

    }
}