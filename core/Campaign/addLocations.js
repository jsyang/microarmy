
define(['core/util/$', 'core/util/weightedRandom'], function($, $WR) {
  return function(_) {
    var buildLocation, dist2, distThreshold, findOrigin, getTile, lastOrigin, loc, locs;
    _ = $.extend({
      numLocations: 10
    }, _);
    if ((_.map == null) || (_.peaks == null)) {
      throw new Error('input needs generated terrain!');
    } else {
      getTile = function(x, y) {
        if ((_.map[y] != null) && (_.map[y][x] != null)) {
          return _.map[y][x];
        } else {
          return void 0;
        }
      };
      dist2 = function(p1, p2) {
        var dx, dy, _ref;
        if ((p1 != null) && (p2 != null)) {
          _ref = [p2.x - p1.x, p2.y - p1.y], dx = _ref[0], dy = _ref[1];
          return dx * dx + dy * dy;
        } else {
          return 0;
        }
      };
      findOrigin = function(origin0) {
        var i, origin1, _i;
        for (i = _i = 0; _i <= 3; i = ++_i) {
          origin1 = $.pickRandom(_.peaks);
          if (dist2(origin0, origin1) < distThreshold) {
            return origin1;
          }
        }
      };
      buildLocation = function(origin) {
        var i, loc, tile, tx, ty, x, y, _i, _ref, _ref1, _ref2;
        _ref = [_.w * 0.2 * ($.r() - $.r()), _.h * 0.2 * ($.r() - $.r())], tx = _ref[0], ty = _ref[1];
        _ref1 = [origin.x, origin.y], x = _ref1[0], y = _ref1[1];
        for (i = _i = 0; _i <= 9; i = ++_i) {
          _ref2 = [(x + tx) >> 0, (y + ty) >> 0], x = _ref2[0], y = _ref2[1];
          tile = getTile(x, y);
          loc = {
            type: $WR({
              'city': 4,
              'base': 1
            })
          };
          if ((tile != null) && tile.height >= _.seaLevel) {
            loc = $.extend({
              x: x,
              y: y,
              peak: origin
            }, loc);
            tile.location = loc;
            tile.road = true;
            return loc;
          }
        }
      };
      locs = [];
      distThreshold = _.w * _.h * 0.6;
      while (locs.length !== _.numLocations) {
        lastOrigin = findOrigin(lastOrigin);
        if (lastOrigin != null) {
          loc = buildLocation(lastOrigin);
          if (loc != null) {
            locs.push(loc);
          }
        }
        distThreshold *= 0.98;
      }
      _.locations = locs;
      return _;
    }
  };
});

// Generated by CoffeeScript 1.5.0-pre
