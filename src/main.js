var audio = require('./audio');
var sounds = require('./sounds');



// Entry-point

window.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {

    audio
        .init({ from: 'assets/sounds/', sounds: sounds })
        .then(function(){ console.info('Sound effects loaded.'); });

});