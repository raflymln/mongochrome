const { connection, connect } = require('mongoose');
const { Collection } = require('./structures/Constant');
const { checkVersion } = require('./structures/Util')
const Database = require('./Database');

class Base {

    /**
     * Base Class Function for Mongochrome
     * @example
     * const Mongochrome = require('mongoose');
     * const db = Mongochrome.Connect(url, connectOptions, options);
     */
    constructor() {}

    /**
     * Collection of All Cached Data
     * @returns {Array<Object>}
     * @example
     * const Mongochrome = require('mongoose');
     * const data = Mongochrome.Collections
     */
    get Collections() {
        return Collection
    }

    /**
     * Connect to MongoDB Cluster and Database
     * @returns {Class<Database>}
     * @param {String} connectURL MongoDB Cluster URL
     * @param {Object} connectOptions MongoDB Connect URL
     * @param {Object} options Additional Options
     * @example
     * const Mongochrome = require('mongoose');
     * const db = Mongochrome.Connect(url, connectOptions, options);
     * db("users"); //This Function is Calling Database Class by Default
     */
    Connect(connectURL, connectOptions, options) {

        checkVersion()
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
            });

        });

        return (name) => new Database(name);

    }

}

module.exports = new Base;