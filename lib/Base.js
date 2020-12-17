'use strict';

const { connection, connect } = require('mongoose');
const { Collection } = require('./structures/Constant');
const Database = require('./Database');
const Utils = require('./structures/Utils');

class Base {

    /**
     * Base Class Function for Mongochrome
     * @example
     * const Mongochrome = require('mongochrome');
     * const db = Mongochrome.Connect(url, connectOptions, options);
     */
    constructor() {
        this.Utils = Utils;
    }


    /**
     * Collection of All Cached Data
     * @returns {Array<Object>}
     * @example
     * const Mongochrome = require('mongochrome');
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
     * // [Example]
     * const connectURL = "mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority";
     * 
     * const connectOptions = {
     *      useNewUrlParser: true,
     *      useUnifiedTopology: true,
     *      useFindAndModify: false,
     *      useCreateIndex: true,
     *      autoIndex: false
     * }
     * 
     * const options = {
     *      onOpen: () => console.log("Connected to Database!"),
     *      onError: (err) => console.log(err),
     *      onLoad: (size) => console.log(`Loaded ${size} Collection`)
     * }
     * 
     * const Mongochrome = require('mongochrome');
     * const db = Mongochrome.Connect(connectURL, connectOptions, options);
     * db("users"); //This Function is Calling Database Class by Default
     */
    Connect(connectURL, connectOptions, options) {
        Utils
            .checkPackageVersion()
            .then((isCorrectVersion) => {
                if (isCorrectVersion) {
                    connect(connectURL, connectOptions);
                    connection.on('error', (err) => options.onError(err));
                    connection.once('open', async() => {
                        options.onOpen();
                        await Utils.syncAllData(options.onLoad);
                    });
                } else {
                    console.log('\x1b[31m%s\x1b[0m', '[Mongochrome] Found Error While Validating Current Package. Aborting Process. . .');
                }
            });

        return (name) => new Database(name);
    }

}

module.exports = new Base;