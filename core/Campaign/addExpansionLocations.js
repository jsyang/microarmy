// Generated by CoffeeScript 1.4.0

define(['core/util/$', 'core/util/weightedRandom'], function($, $WR) {
  return function(_) {
    var expandLocation, expandedLocs, getTile, loc, _i, _len, _ref;
    expandedLocs = [];
    if (!(_.map != null) || !_.locations) {
      throw new Error('input needs generated terrain!');
    } else {
      getTile = function(x, y) {
        if ((_.map[y] != null) && (_.map[y][x] != null)) {
          return _.map[y][x];
        } else {
          return void 0;
        }
      };
      expandLocation = function(origin) {
        var expansionLoc, expansionType, i, tile, x, y, _i, _ref;
        _ref = [origin.x, origin.y], x = _ref[0], y = _ref[1];
        for (i = _i = 0; _i <= 4; i = ++_i) {
          if ($.R(0, 1)) {
            x += $.R(0, 1) ? 1 : -1;
          } else {
            y += $.R(0, 1) ? 1 : -1;
          }
          tile = getTile(x, y);
          if ((tile != null) && tile.height >= _.seaLevel && !(tile.location != null)) {
            switch (origin.type) {
              case 'city':
                expansionType = $WR({
                  'oilwell': 1,
                  'farm': 4,
                  'factory': 1,
                  'mine': 2
                });
                break;
              case 'base':
                expansionType = $WR({
                  'oilwell': 2,
                  'farm': 1,
                  'factory': 3,
                  'mine': 1
                });
            }
            expansionLoc = {
              x: x,
              y: y,
              type: expansionType
            };
            tile.location = expansionLoc;
            tile.road = true;
            expandedLocs.push(expansionLoc);
          }
        }
      };
      _ref = _.locations;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        loc = _ref[_i];
        expandLocation(loc);
      }
      _.locations = _.locations.concat(expandedLocs);
      return _;
    }
  };
});