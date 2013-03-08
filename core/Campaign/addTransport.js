
define(function() {
  return function(_) {
    var loc, locs, pave, route, _i, _len;
    if ((_.map == null) || (_.locations == null)) {
      throw new Error('map or location not set!');
    } else {
      pave = function(tile) {
        if (tile.height >= _.seaLevel) {
          return tile.road = true;
        } else {
          return false;
        }
      };
      route = function(c, d) {
        var a, b, dx, dxGZ, dy, dyGZ, x, xSplit, y, ySplit, _ref;
        _ref = d.x < c.x ? [c, d] : [d, c], a = _ref[0], b = _ref[1];
        dx = a.x < b.x ? 1 : -1;
        dy = a.y < b.y ? 1 : -1;
        if (a.x === b.x) {
          y = a.y;
          while (y !== b.y) {
            if (!pave(_.map[y][a.x])) {
              break;
            }
            y += dy;
          }
        } else if (a.y === b.y) {
          x = a.x;
          while (x !== b.x) {
            if (!pave(_.map[a.y][x])) {
              break;
            }
            x += dx;
          }
        } else {
          if ($.R(0, 1)) {
            dxGZ = dx > 0;
            xSplit = dxGZ ? $.R(a.x, b.x) : $.R(b.x, a.x);
            x = a.x + dx;
            while ((dxGZ && x < xSplit) || (!dxGZ && x > xSplit)) {
              if (!pave(_.map[a.y][x])) {
                break;
              }
              x += dx;
            }
            x = b.x - dx;
            while ((dxGZ && x >= xSplit) || (!dxGZ && x <= xSplit)) {
              if (!pave(_.map[b.y][x])) {
                break;
              }
              x -= dx;
            }
            y = a.y;
            while (y !== b.y) {
              if (!pave(_.map[y][xSplit])) {
                break;
              }
              y += dy;
            }
          } else {
            dyGZ = dy > 0;
            ySplit = dyGZ ? $.R(a.y, b.y) : $.R(b.y, a.y);
            y = a.y + dy;
            while ((dyGZ && y < ySplit) || (!dyGZ && y > ySplit)) {
              if (!pave(_.map[y][a.x])) {
                break;
              }
              y += dy;
            }
            y = b.y - dy;
            while ((dyGZ && y >= ySplit) || (!dyGZ && y <= ySplit)) {
              if (!pave(_.map[y][b.x])) {
                break;
              }
              y -= dy;
            }
            x = a.x;
            while (x !== b.x) {
              if (!pave(_.map[ySplit][x])) {
                break;
              }
              x += dx;
            }
          }
        }
      };
      locs = _.locations;
      if (locs.length > 1) {
        for (_i = 0, _len = locs.length; _i < _len; _i++) {
          loc = locs[_i];
          if ($.R(0, 2)) {
            route(loc, $.AR($$.without(locs, loc)));
          }
        }
      }
      return _;
    }
  };
});

// Generated by CoffeeScript 1.5.0-pre
