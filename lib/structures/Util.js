'use strict';

const { simpleflake } = require('simpleflakes');
const axios = require('axios');
const fs = require('fs');
const path = require("path");

class Utils {

    /**
     * Mongochrome Utils
     */
    constructor() {

        /**
         * Used to check version of Mongochrome between your client and server.
         */
        this.checkPackageVersion = async() => {
            const alert = (msg) => console.log('\x1b[31m%s\x1b[0m', "[Mongochrome] ".concat(msg));
            var localPackage, gitPackage;

            axios
                .get('https://raw.githubusercontent.com/raflymln/mongochrome/main/package.json')
                .then(value => {
                    gitPackage = value.data

                    try {
                        localPackage = fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'));
                    } catch (err) {
                        alert(`Error While Getting Local Package Version!\n${err}`);
                        return false;
                    }

                    localPackage = JSON.parse(localPackage);

                    if (!localPackage || !gitPackage) {
                        alert('Missing Package Version from Either Official Package or This Package. Please Try to Reinstall this Package!');
                        return false;
                    }

                    if (localPackage.version !== gitPackage.version) {
                        alert('Found Differences in Package Version Between Official Package with This Current Package. Please Reinstall This Package!');
                        return false;
                    }

                    return true;
                })
                .catch((err) => {
                    alert(`Error While Getting Official Package Version!\n${err}`);
                    return false;
                })
        }


        /**
         * If specified array was an object, it used to give an Unique ID to every of it.
         * @param {Array} value Array of Object
         * @returns {Array<any>}
         * @example
         * parseArray([{ a:1 }, { b:2 }]);
         * 
         * // It'll return something like:
         * [{
         *      _id: 'hzymy0',
         *      a: 1
         * }, {
         *      _id: 'adsP31',
         *      b: 2
         * }]
         */
        this.parseArray = (value) => {
            if (!Array.isArray(value)) throw new Error('Data is not an Array and Cannot be Parsed!')

            for (var data of value) {
                if (typeof data == 'object' && !data._id) {
                    data._id = simpleflake().toString(16);
                }
            }

            return value;
        }


        /**
         * Used to parse key like "items.sword" to get its object key
         * @param {String} key Key
         * @returns {Object}
         * @example
         * parseKey("items.sword");
         * 
         * // It'll return something like:
         * {
         *      key: "items",
         *      name: "sword"
         * }
         */
        this.parseKey = (key) => {
            if (!key || typeof key !== "string") throw new Error('Key Must be a String!');

            var name;

            if (key.includes(".")) {
                const prop = key.split('.');
                key = prop[0];
                name = prop.slice(1).join('.');

                if (name.includes('.')) throw new Error('Invalid Key Name!');
            }

            return { key, name };
        }


        /**
         * Parse a key, and then assign a data to it
         * 
         * **[NOTICE]** Key specified must be unparsed!
         * @param {String} key Unparsed Key
         * @param {Any} value Data Value
         * @param {Object} data Data to Assign
         * @returns {Any | Object}
         * @example
         * setData("items.sword", "1", { butter: "2" })
         * 
         * // It'll return something like:
         * {
         *      butter: "2",
         *      sword: "1"
         * }
         */
        this.setData = (key, value, data) => {
            const obj = this.parseKey(key);

            return (!obj.name) ? value : Object.assign(data, {
                [obj.name]: value
            });
        }

    }

}


module.exports = new Utils;