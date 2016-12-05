/**
 * Application entry-point
 */

var audio = require('./audio');
var graphics = require('./graphics');
var JSZip = require('jszip');
var JSZipUtils = require('jszip-utils');

/**
 * @param {any} zip
 * @returns {Promise}
 */
function initAudioFromZip(zip) {
    var loadSounds = [];
    var soundNames = [];

    function addFileToLoadSoundsPromise(relativePath, file) {
        soundNames.push(
            file.name
                .replace(/^sounds\//gi, '')
                .replace(/\.ogg/gi, '')
        );
        loadSounds.push(file.async('arraybuffer'));
    }



    zip.folder('sounds/').forEach(addFileToLoadSoundsPromise);

    function defineSounds(buffers) {
        for (var i = 0; i < buffers.length; i++) {
            audio.define(soundNames[i], buffers[i]);
        }
    }

    audio.init();

    return JSZip.external.Promise
        .all(loadSounds)
        .then(defineSounds);
}

function initImagesFromZip(zip) {
    var loadImages = [];
    var imageNames = [];

    function addFileToLoadImagesPromise(relativePath, file) {
        imageNames.push(
            file.name
                .replace(/^images\//gi, '')
                .replace(/\.png/gi, '')
        );
        loadImages.push(file.async('arraybuffer'));
    }

    zip.folder('images/').forEach(addFileToLoadImagesPromise);

    function defineImages(buffers) {
        for (var i = 0; i < buffers.length; i++) {
            graphics.define(imageNames[i], buffers[i]);
        }
    }

    graphics.init();

    return JSZip.external.Promise
        .all(loadImages)
        .then(defineImages);
}

function onAssetsZipLoaded(zip) {
    JSZip.external.Promise
        .all([initAudioFromZip(zip), initImagesFromZip(zip)])
        .then(onAssetsReady);
}

function onAssetsReady() {
    console.info('Assets loaded! Start game!');
    document.body.style.background = 'black';

    setTimeout(testGFX, 500);
}

function testGFX() { graphics.draw('ammodump/ammodump-0-0-0', 0, 0); }

// Entry-point
window.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {

    // Load all resources from assets.zip
    new JSZip.external
        .Promise(function (resolve, reject) {
            JSZipUtils.getBinaryContent('assets.zip', function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
        .then(function (data) { return JSZip.loadAsync(data); })
        .then(onAssetsZipLoaded);


    window.app = {
        graphics: graphics,
        audio: audio
    };
});