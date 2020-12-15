const { Schema, model } = require('mongoose');

module.exports = {
    Collection: new Object(),
    Schema: function(name) {
        var DatabaseSchema;

        try {
            DatabaseSchema = model(name)
        } catch (err) {
            DatabaseSchema = model(name, new Schema({
                key: String,
                value: Schema.Types.Mixed
            }))
        }

        return DatabaseSchema;
    }
};