const { connection } = require('mongoose');
const { Collection, Schema } = require('./Constant');

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
            if (!Collection[this.name]) Collection[this.name] = new Array;
            Collection[this.name].push({ ID: rawData._id, key, data });
        } else {
            this.get(key).data = rawData.data
        }

        await rawData.save().catch(err => connection.emit('error', err));
        return rawData.data;

    }

    async delete(key) {
        if (!this.get(key)) return;
        await this.schema.findOneAndDelete({ key }).catch(err => connection.emit('error', err));

        const dataIndex = Collection[this.name].map(x => x.key).indexOf(key);
        if (dataIndex > -1) Collection[this.name].splice(dataIndex, 1);

        return true;
    }

    async deleteAll() {
        await this.schema.deleteMany().catch(err => connection.emit('error', err));
        Collection[this.name] = new Array;
        return this.data;
    }

    all() {
        return this.data;
    }

    get(key) {
        return (this.data && this.data.find(data => data.key === key)) ? this.data.find(data => data.key === key).data : false;
    }

}

module.exports = Database