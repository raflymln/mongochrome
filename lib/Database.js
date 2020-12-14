const { connection } = require('mongoose');
const { Collection, Schema } = require('./Constant');
const Util = require('./Util')

class Database {

    constructor(name) {
        this.name = name;
        this.schema = Schema(name);
    }

    get data() {
        return Collection[this.name];
    }

    async fetchAll() {

        const documents = await this.schema.find()
        Collection[this.name] = documents.map(data => ({
            ID: data._id,
            key: data.key,
            data: data.data
        }));

        return this.data

    }

    async set(key, data) {

        var rawData = await this.schema.findOne({ key });
        const rawCache = this.get(key);

        if (!rawData) {
            rawData = new this.schema({ key, data });
        } else {
            rawData.data = data;
        }

        if (!rawCache) {
            if (!this.data) Collection[this.name] = new Array;
            this.data.push({ ID: rawData._id, key, data });
        } else {
            this.data.find(data => data.key === key).data = rawData.data
        }

        await rawData.save().catch(err => connection.emit('error', err));
        return rawData.data;

    }

    async push(key, data) {

        if (!Array.isArray(data)) throw new Error('Data Value is not an Array!');
        var rawData = this.get(key);

        if (!rawData) {
            return await this.set(key, data);
        } else {
            if (!Array.isArray(rawData)) throw new Error(`Expected target type to be Array, received ${typeof rawData}!`);
            data.map(x => {
                data._id =
                    rawData.push(x)
            })
            return await this.set(key, rawData);
        }

    }

    async delete(key) {
        if (!this.get(key)) return;
        await this.schema.findOneAndDelete({ key }).catch(err => connection.emit('error', err));

        const dataIndex = this.data.map(x => x.key).indexOf(key);
        if (dataIndex > -1) this.data.splice(dataIndex, 1);

        return true;
    }

    async deleteAll() {
        await this.schema.deleteMany().catch(err => {
            connection.emit('error', err);
            return false;
        });
        Collection[this.name] = new Array;
        return true;
    }

    get(key) {
        const document = (this.data) ? this.data.find(data => data.key === key) : false;
        return (document) ? document.data : false;
    }

}

module.exports = Database