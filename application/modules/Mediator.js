class Mediator {
    constructor({ EVENTS, TRIGGERS }) {
        this.EVENTS = EVENTS;
        this.TRIGGERS = TRIGGERS;
        this.events = {};
        this.triggers = {};
        Object.values(EVENTS).forEach(value => this.events[value] = []);
        Object.values(TRIGGERS).forEach(value => this.triggers[value] = () => { return null; });
    }

    /** about triggers  **/
    getTriggerNames() {
        return this.TRIGGERS;
    }

    set(name, func) {
        if(name && func instanceof Function) {
            return this.triggers[name] = func;
        }
    }

    get(name, data) {
        if(this.triggers[name] && this.triggers[name] instanceof Function) {
            return this.triggers[name](data);
        }
    }


    /** about events **/
    getEventNames() {
        return this.EVENTS;
    }

    subscribe(name, func) {
        if (this.events[name] && func instanceof Function) {
            return this.events[name].push(func);
        }
    }

    call(name, data) {
        if(this.events[name]) {
            this.events[name].forEach(event => {
                if(event instanceof Function) {
                    return event(data);
                }
            });
        }
    }
}

module.exports = Mediator;