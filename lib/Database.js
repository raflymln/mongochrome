const { Collection, Schema } = require('./structures/Constant');
const { setData, parseKey, parseArray } = require('./structures/Util')

class Database {

    /**
     * This Class is Called From a Function on ./Base.js
     * @arg {String} name Collection Name
     * @arg {Object} schema Collection Schema
     * @example
     * const Mongochrome = require('mongoose');
     * const db = Mongochrome.Connect(url, connectOptions, options);
     * 
     * db("users"); //This Function is Calling this Class by Default
     */
    constructor(name) {
        this.name = (name.endsWith('s')) ? name : name.concat('s');
        this.schema = Schema(name);
    }

    /**
     * Get All Cached Data from This Collection
     * @returns {Array<Object>}
     * @example 
     * db("users").data
     */
    get data() {
        return Collection[this.name];
    }

    /**
     * Get Specific Cached Data Value by Key from This Collection
     * @param {String} key Key
     * @returns {Object | Array} 
     * @example
     * // Getting Full Data
     * db("items").get("sword")
     * 
     * // Getting an Object on Data
     * db("items").get("sword.level")
     */
    get(key) {
        const obj = parseKey(key)
        const document = (this.data) ? this.data.find(data => data.key === obj.key) : false;

        if (document) {
            if (obj.name) {
                return document.value[obj.name]
            } else {
                return document.value
            }
        } else {
            return false;
        }
    }

    /**
     * Get Full Data Object, Including Data "_id", "key", and "value" from This Collection
     * @param {String} key Key
     * @returns {Object}
     * @example
     * db("items").getFull("sword")
     */
    getFull(key) {
        const obj = parseKey(key);
        return (this.data) ? this.data.find(data => data.key === obj.key) : false;
    }

    /**
     * Sync Local Cached Data with Data from Database
     * 
     * **[NOTICE]** This function is called when connection to database established, to cached all data from beginning
     * 
     * **[IMPORTANT]** Everytime you make a changes directly from database server, please sync it with this function!
     * @async
     * @returns {Promise<Array<Object>>}
     * @example
     * db("users").syncData()
     */
    async syncData() {
        return Collection[this.name] = await this.schema.find()
    }

    /**
     * Set a Data to Database 
     * @async
     * @param {String} key Key
     * @param {String | Object | Array} value Data
     * @returns {Promise<Object>}
     * @example
     * // Setting Up a Single Object
     * db("character").set("user1", { stamina: {...} })
     * 
     * // Setting Up an Object in Object Value
     * db("character").set("user1.level", "5")
     */
    async set(key, value) {

        const obj = parseKey(key);
        var document = await this.schema.findOne({ key: obj.key });

        if (Array.isArray(value)) value = parseArray(value);

        if (!document) {

            document = new this.schema({
                key: obj.key,
                value: setData(key, value, {})
            });

            if (!this.get(obj.key)) {
                if (!this.data) Collection[this.name] = new Array;
                this.data.push(document);
            }

        } else {

            document.value = setData(key, value, document.value);
            this.data.find(value => value.key === obj.key).value = document.value;

            // [DO NOT EDIT!] - https://stackoverflow.com/questions/24054552/mongoose-not-saving-nested-object
            document.markModified('value');

        }

        return await document
            .save()
            .catch(err => {
                connection.emit('error', err);
                return false;
            });
    }

    /**
     * Push an Array of Data
     * 
     * **[IMPORTANT]** Value Must be an Array
     * @async
     * @param {String} key Key
     * @param {Array<any>} value Array of Data
     * @returns {Promise<Object>}
     * @example
     * // Automatically create an array if data doesn't available before
     * db("character").push("list", ["char1", "char2"])
     * 
     * // You can also push directly into an Object
     * db("character").push("user1.items", ["sword", "banana"])
     */
    async push(key, value) {
        if (!Array.isArray(value)) throw new Error('Data Value is not an Array!');

        const obj = parseKey(key);
        var document = this.get(obj.key);
        value = parseArray(value);

        if (!document) {
            document = setData(key, value, {});
        } else {

            if (obj.name) {
                if (document[obj.name] !== undefined) {
                    if (!Array.isArray(document[obj.name])) throw new Error(`Expected target type to be Array, received ${typeof document}!`);
                    if (!document[obj.name]) document[obj.name] = new Array;

                    document[obj.name] = document[obj.name].concat(value)
                } else {
                    document[obj.name] = value
                }
            } else {
                if (!Array.isArray(document)) throw new Error(`Expected target type to be Array, received ${typeof document}!`);

                document = document.concat(value)
            }

        }

        return await this.set(obj.key, document);
    }

    /**
     * Delete a Data found by Key Value
     * @async
     * @param {String} key Key
     * @returns {Boolean}
     * @example
     * db("character").delete("user1")
     */
    async delete(key) {
        const obj = parseKey(key);
        if (!this.get(obj.key)) return false;

        await this.schema
            .findOneAndDelete({ key: obj.key })
            .catch(err => {
                connection.emit('error', err);
                return false;
            });

        const dataIndex = this.data.map(x => x.key).indexOf(obj.key);
        if (dataIndex > -1) this.data.splice(dataIndex, 1);

        return true;
    }

    /**
     * Delete All Data from This Collection
     * @async
     * @returns {Boolean}
     * @example
     * db("character").deleteAll()
     */
    async deleteAll() {
        await this.schema
            .deleteMany()
            .catch(err => {
                connection.emit('error', err);
                return false;
            });

        delete Collection[this.name]
        return true;
    }

}

module.exports = Database