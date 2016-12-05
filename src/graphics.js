/**
 * Graphics interface
 */
var UrlCreator = window.URL || window.webkitURL;

var canvas;
var ctx2d;
var images;

var width;
var height;

function init() {
    canvas = document.querySelector('canvas');
    images = {};

    window.addEventListener('resize', onResize);
    updateDimensions();
}

function updateDimensions() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx2d = canvas.getContext('2d');
}

function onResize() {
    updateDimensions();
}

function clear() {
    ctx2d.clearRect(0, 0, width, height);
}

function define(name, buffer) {
    images[name] = new Image();
    images[name].src = UrlCreator.createObjectURL(new Blob([buffer], { type: 'image/png' }));
}

function draw(name, x, y) {

    ctx2d.drawImage(images[name], x, y);
}

module.exports = {
    init: init,
    define: define,
    draw: draw,
    clear: clear
};