// Generated by CoffeeScript 1.4.0

define(['core/util/$'], function($) {
  var i, makeSector, sectors;
  makeSector = function(i) {
    var sector;
    return sector = {
      x: i,
      y: 5,
      height: $.R(1, 15),
      locations: {},
      road: $.R(0, 1) === 1
    };
  };
  return sectors = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i <= 4; i = ++_i) {
      _results.push(makeSector(i));
    }
    return _results;
  })();
});
