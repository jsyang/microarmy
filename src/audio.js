var audioLoader = require('audio-loader');
var audioContext;

var soundFilesBuffers;

/**
 * @param {object} options
 * @param {string} options.from
 * @param {object} options.sounds key = sound name ; value = sound file name
 */
function init(options) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return load(options.sounds, { from: options.from });
}

function remove() {
    soundFilesBuffers = undefined;
    audioContext = undefined;
}

// Load external sound files
// API here: https://github.com/danigb/audio-loader
function load(source, options) {
    return audioLoader(source, options)
        .then(function (audio) {
            soundFilesBuffers = audio;
        });
}

/**
 * @param {string} soundName
 */
function play(soundName) {
    if (soundFilesBuffers) {
        var source = audioContext.createBufferSource();
        source.buffer = soundFilesBuffers[soundName];
        source.connect(audioContext.destination);
        source.start();
    }
}

/**
 * @returns {Boolean}
 */
function isLoaded() {
    return soundFilesBuffers != null;
}

module.exports = {
    init: init,
    remove: remove,
    play: play,
    isLoaded: isLoaded
};