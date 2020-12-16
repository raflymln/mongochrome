'use strict';

const { Schema, model } = require('mongoose');

module.exports.Collection = new Object();

module.exports.Schema = (name) => {
    var modelSchema;
    try {
        modelSchema = model(name);
    } catch (err) {
        modelSchema = model(name, new Schema({
            key: String,
            value: Schema.Types.Mixed
        }));
    }
    return modelSchema;
}