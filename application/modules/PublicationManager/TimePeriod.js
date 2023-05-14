const ArtTypes = require("./ArtType");

class TimePeriod {
    constructor(period = null) {
        this.period = period;

        this.all = new ArtTypes;
        this.mostPopular = new ArtTypes;

        this.initDate = Date.now();
        this._updateInfo();
    };

    _updateInfo() {
        if(this.period) {
            setInterval(() => {
                if(Date.now() - this.initDate > this.period) {
                    this.all.updateArtList();
                    this.mostPopular.updateArtList();
                    this.initDate = Date.now();
                }
            }, 60000);
        } else {
            setInterval(() => {
                if(Date.now() - this.initDate > 600000) { // every 10 mins update top of most popular
                    this.mostPopular.updateArtList();
                    this.initDate = Date.now();
                }
            }, 60000);
        }
    }
}

module.exports = TimePeriod;