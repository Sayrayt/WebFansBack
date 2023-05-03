class Storage {
    constructor() {
        this.storage = {};
    };

    addEntity(key, value) {
        if(key && value) {
            this.storage[key] = value;
        }
    }

    getEntity(key) {
        return (key && this.storage[key]) ? this.storage[key] : {};
    }

    deleteEntity(key) {
        if(key && this.storage[key]) {
            delete this.storage[key];
        }
    }

    add(key, innerKey, value) {
        if(key && value && innerKey && this.storage[key]) {
            this.storage[key][innerKey] = value;
        }
    }

    get(key, innerKey) {
        if(key && innerKey && this.storage[key] && this.storage[key][innerKey]) {
            return this.storage[key][innerKey];
        }
        return null;
    }

    delete(key, innerKey) {
        if(key && innerKey && this.storage[key] && this.storage[key][innerKey]) {
            delete this.storage[key][innerKey];
        }
    }
}

module.exports = Storage;