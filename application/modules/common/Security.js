const hash = require('object-hash');

class Security {
    constructor() {}

    encryptData = function(params, { random, token }) {
        const rndValue = (random ? random : randomString());
        const tokenVal = (token ? token : null);

        const sortedParams = sortParams(params);
        const hashedParams = hash(sortedParams);
        const encryptedParams = hashedParams + rndValue;
        const hashedToken = hash({hashedParams, rndValue});

        const tokenBase = { tokenVal, rndValue };
        const implicitTokenParams =  { ...tokenBase, ...sortedParams};
        const hashed = (tokenVal ? hash(implicitTokenParams) : null);

        return {
            hashedParams,
            encryptedParams,
            token: hashedToken,
            hash: hashed,
            random: rndValue
        }
    }
}

function randomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let counter = 0;
    while (++counter < 7) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function sortParams(params) {
    const soretedArr = Object.entries(params).sort((x, y) => {
        const key1 = x[0];
        const key2 = y[0];
        return key1.localeCompare(key2);
    });
    const sortedObj = {};
    soretedArr.forEach(param => {
        const key = param[0];
        const value = param[1];
        sortedObj[`${key}`] = value;
    });
    return sortedObj;
}

module.exports = Security;