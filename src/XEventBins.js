// todo: these have the potential to be stored as numbers for
// bit-shifts to simplify bin calculation, if a bin width is
// limited to a power of 2 size 
var DEFAULT_BIN_WIDTH = 1 << 6;
var DEFAULT_MAX_X = 1 << 12;
var DEFAULT_MAX_COUNT = 1 << 16;

/**
 * Event tally which counts the number of occurrences of a
 * specific type of event if it falls inside x-coordinate 0
 * up to maxX. This implements a bin data structure.
 * https://en.wikipedia.org/wiki/Bin_(computational_geometry)
 * @param {object} options
 * @param {number} options.binWidth
 * @param {number} options.maxX
 * @param {number} options.maxCount
 */
function XEventBins(options) {
    // If constructor was not called with the `new` keyword
    if(!(this instanceof XEventBins)){
        return new XEventBins(options);
    }

    options = options || {};
    this.binWidth = options.binWidth || DEFAULT_BIN_WIDTH;
    this.maxX = options.maxX || DEFAULT_MAX_X;
    this.maxCount = options.maxCount || DEFAULT_MAX_COUNT;

    this.flush();
}

/**
 * Empties the bins
 */
XEventBins.prototype.flush = function flush() {
    this.bins = new Uint16Array(Math.ceil(this.maxX / this.binWidth));
};

/**
 * Return details for bin which contains the highest count 
 * of event instances
 */
XEventBins.prototype.getModeBin = function getModeBin() {
    var maxValue = 0;
    var maxIndex = -1;
    for (var i = 0; i < this.bins.length; i++) {
        if (maxValue < this.bins[i]) {
            maxValue = this.bins[i];
            maxIndex = i;
        }
    }

    return {
        value: maxValue,
        index: maxIndex,
        minX: index * this.binWidth,
        maxX: (index + 1) * this.binWidth
    }
};

/**
 * @param {object} entity
 * @param {number} entity.x
 */
XEventBins.prototype.add = function add(entity) {
    this.bins[Math.floor(entity.x / this.binWidth)]++;
};

module.exports = XEventBins;