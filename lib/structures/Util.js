const { simpleflake } = require('simpleflakes');
const axios = require('axios');
const fs = require('fs');
const path = require("path");

module.exports.checkVersion = async() => {
    var packageData;

    try {
        packageData = fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'));
    } catch (err) {
        throw new Error(`[Mongochrome] Error While Validating Package Version!\n${err}`);
    }

    var packageGit = await axios
        .get('https://raw.githubusercontent.com/raflymln/mongochrome/main/package.json')
        .catch((err) => {
            throw new Error(`[Mongochrome] Error While Validating Package Version!\n${err}`);
        })

    packageData = JSON.parse(packageData);
    packageGit = packageGit.data;

    if (!packageData || !packageGit) {
        throw new Error('[Mongochrome] Missing Package Version from Either Official Package or This Package. Please Try to Reinstall this Package!');
    }

    packageData = packageData.version.replace(/[^0-9]+/g, "");
    packageGit = packageGit.version.replace(/[^0-9]+/g, "");

    if (packageData !== packageGit) {
        console.log('[Mongochrome] Found Differences in Package Version Between Official Package with This Current Package. Please Reinstall This Package!')
    }

    return true;
}

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