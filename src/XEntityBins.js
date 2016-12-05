// todo: these have the potential to be stored as numbers for
// bit-shifts to simplify bin retrieval 
var DEFAULT_BIN_WIDTH = 1 << 6;
var DEFAULT_MAX_X = 1 << 12;

/**
 * Break up the game world into horizontal buckets for targeting, 
 * collision detection, etc. Implements a bin data structure to avoids 
 * checking on distant entities.
 * https://en.wikipedia.org/wiki/Bin_(computational_geometry)
 * @param {object} options
 * @param {number} options.maxX
 * @param {number} options.binWidth
 */
function XEntityBins(options) {
    // If constructor was not called with the `new` keyword
    if (!(this instanceof XEntityBins)) {
        return new XEntityBins(options);
    }

    options = options || {};
    this.binWidth = options.binWidth || DEFAULT_BIN_WIDTH;
    this.maxX = options.maxX || DEFAULT_MAX_X;

    this.flush();
}

/**
 * Empties the bins
 */
XEntityBins.prototype.flush = function flush() {
    this.bins = [];
    for (var i = Math.ceil(this.maxX / this.binWidth); i > 0; i--) {
        this.bins.push([]);
    }
};

/**
 * @param {object} entity
 * @param {number} entity.x
 */
XEntityBins.prototype.add = function add(entity) {
    var targetBin = this.bins[Math.floor(entity.x / this.binWidth)];
    if (targetBin) {
        targetBin.push(entity);
    }
};

// todo: various functions not yet ported from XHash.coffee

module.exports = XEntityBins;