const { connection, connect } = require('mongoose');
const { Collection } = require('./Constant');
const Database = require('./Database');

module.exports = {
    Collection,
    Connect: (connectURL, connectOptions, options) => {

        connect(connectURL, connectOptions);
        connection.on('error', err => options.onError(err));
        connection.once('open', () => {

            options.onOpen();
            connection.db.listCollections().toArray((err, collections) => {
                if (err) throw new Error(err);

                collections.map(async x => {
                    const db = new Database(x.name);
                    Collection[x.name] = new Array;
                    await db.fetchAll();
                });

                ready = true;
            });

        });

        return function(name) {
            return new Database(name)
        };

    }
}