/**
 * Random functions
 */

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function int(min, max) {
    return Math.round(min + Math.random() * (max - min));
}

/**
 * @param {Array} a
 * @returns {any}
 */
function arrayEl(a) {
    return a[Math.floor(a.length * Math.random())];
}

module.exports = {
    int: int,
    arrayEl: arrayEl
};
