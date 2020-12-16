const { simpleflake } = require('simpleflakes');


module.exports.parseArray = (value) => {
    if (!Array.isArray(value)) throw new Error('Data is not an Array and Cannot be Parsed!')

    for (var data of value) {
        if (typeof data == 'object' && !data._id) {
            data._id = simpleflake().toString(16);
        }
    }

    return value;
}

module.exports.parseKey = (key) => {
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

module.exports.setData = (key, value, data) => {
    const obj = this.parseKey(key);

    return (!obj.name) ? value : Object.assign(data, {
        [obj.name]: value
    });
}