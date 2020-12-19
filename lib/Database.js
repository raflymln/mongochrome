'use strict';

const { connection } = require('mongoose');
const { Collection, Schema } = require('./structures/Constant');
const { setData, parseKey, parseArray, syncAllData, parseCollectionName } = require('./structures/Utils');

class Database {

    /**
     * This Class is Called From a Function on ./Base.js
     * @arg {String} name Collection Name (Always ends with "s")
     * @arg {Object} schema Collection Schema
     * @example
     * const Mongochrome = require('mongochrome');
     * const db = Mongochrome.Connect(url, connectOptions, options);
     * 
     * db("users"); //This Function is Calling this Class by Default
     */
    constructor(name) {
        this.name = parseCollectionName(name);
        this.schema = Schema(name);
    }


    /**
     * Get All Cached Data from This Collection
     * @returns {Array<Object>}
     * @example 
     * db("users").data
     */
    get data() {
        if (!connection.readyState) return;
        return Collection[this.name] || [];
    }


    /**
     * Get Cached Data Length from This Collection
     * @returns {Array<Object>}
     * @example 
     * db("users").size
     */
    get size() {
        if (!connection.readyState) return;
        return (this.data) ? this.data.length : 0;
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
        if (!connection.readyState) return;

        const document = this.getFull(key);
        const obj = parseKey(key);

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
     * Find All Data Filtered by Its Value
     * @param {Object | Function | Any} filter Data Filter
     * @returns {Array}
     * @example
     * // With Object
     * db("users").find({id: 1});
     * 
     * // With Function
     * db("users").find((data) => data.value.id == 1);
     * 
     * // Or Else It'll Search by Its Matching Value
     * db("items").find("sword")
     */
    find(filter) {
        if (!connection.readyState) return;

        if (typeof filter == 'object') {
            var filteredData;
            Object.keys(filter).map((key) => {
                filteredData = this.data.filter((data) => data.value[key] == filter[key]);
            })
            return filteredData;
        } else if (typeof filter == 'function') {
            return this.data.filter((data) => filter(data))
        } else {
            return this.data.filter((data) => data.value.includes(filter))
        }

    }


    /**
     * Find **First** Data Filtered by Its Value
     * @param {Object | Function | Any} filter Data Filter
     * @returns {Array}
     * @example
     * // With Object
     * db("users").find({id: 1});
     * 
     * // With Function
     * db("users").find((data) => data.value.id == 1);
     * 
     * // Or Else It'll Search by Its Matching Value
     * db("items").find("sword")
     */
    findOne(filter) {
        const filteredData = this.find(filter);
        return (filteredData.length > 0) ? filteredData[0] : false;
    }


    /**
     * Get Full Data Object, Including Data "_id", "key", and "value" from This Collection
     * @param {String} key Key
     * @returns {Object}
     * @example
     * db("items").getFull("sword")
     */
    getFull(key) {
        if (!connection.readyState) return;

        const obj = parseKey(key);
        return (this.data) ? this.data.find(data => data.key === obj.key) : false;
    }


    /**
     * Sync Local Cached Data with All Data from Database
     * 
     * **[IMPORTANT]** Everytime you make a changes directly from database server, please sync it with this function!
     * @async
     * @returns {Promise<Array<Object>>}
     * @example
     * syncData();
     */
    async syncData() {
        if (!connection.readyState) return;
        return await syncAllData();
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
        if (!connection.readyState) return;

        const obj = parseKey(key);
        var document = await this.schema.findOne({ key: obj.key });

        if (Array.isArray(value)) {
            if (value.length > 0) {
                value = parseArray(value);
            } else {
                return await this.delete(key);
            }
        }

        if (!document) {

            document = new this.schema({
                key: obj.key,
                value: setData(key, value, {})
            });

            if (!this.get(obj.key)) {
                this.data.push(document);
            }

        } else {

            document.value = setData(key, value, document.value);
            this.data.find((index) => index.key === obj.key).value = document.value;

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
        if (!connection.readyState) return;
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
     * Delete a Data found by Key Value.
     * 
     * **[NOTICE]** If There Isn't Any Data Available in the Collection, It'll Delete the Collection
     * @async
     * @param {String} key Key
     * @returns {Boolean}
     * @example
     * db("character").delete("user1")
     * // Or
     * db("character").delete("user1.weapons")
     */
    async delete(key) {
        if (!connection.readyState) return;

        const obj = parseKey(key);
        if (!this.get(key)) return false;

        if (obj.name) {
            var document = this.get(obj.key);
            delete document[obj.name];
            return await this.set(obj.key, document);
        } else {
            await this.schema
                .findOneAndDelete({ key: obj.key })
                .catch(err => {
                    connection.emit('error', err);
                    return false;
                });

            const dataIndex = this.data.map(x => x.key).indexOf(obj.key);
            if (dataIndex > -1) {
                this.data.splice(dataIndex, 1);
            }

            if (this.size === 0) {
                connection.db.dropCollection(this.name);
            }

            return true;
        }
    }


    /**
     * Delete All Data from This Collection, and delete the Collection
     * @async
     * @returns {Boolean}
     * @example
     * db("character").deleteAll()
     */
    async deleteAll() {
        if (!connection.readyState) return;

        await this.schema
            .deleteMany()
            .catch(err => {
                connection.emit('error', err);
                return false;
            });

        delete Collection[this.name];
        connection.db.dropCollection(this.name);
        return true;
    }

}

module.exports = Database