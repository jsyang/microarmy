
define(function() {
  return function(world) {
    var color, el, getTile, html, map, roadClass, shade, tile, tileClass, tileStyle, water, x, y, _i, _j, _ref, _ref1;
    map = world.map;
    getTile = function(x, y) {
      if ((map[y] != null) && (map[y][x] != null)) {
        return map[y][x];
      } else {
        return {};
      }
    };
    roadClass = function(t) {
      var E, N, S, W, x, y, _ref;
      _ref = [t.x, t.y], x = _ref[0], y = _ref[1];
      N = getTile(x, y - 1).road;
      S = getTile(x, y + 1).road;
      E = getTile(x + 1, y).road;
      W = getTile(x - 1, y).road;
      if (N && S && E && W) {
        return 'r2';
      }
      if (N && S && E && !W) {
        return 'r8';
      }
      if (N && S && !E && W) {
        return 'r7';
      }
      if (N && !S && E && W) {
        return 'r10';
      }
      if (!N && S && E && W) {
        return 'r9';
      }
      if (N && !S && E && !W) {
        return 'r6';
      }
      if (!N && S && E && !W) {
        return 'r5';
      }
      if (N && !S && !E && W) {
        return 'r4';
      }
      if (!N && S && !E && W) {
        return 'r3';
      }
      if (!E && !W) {
        return 'r0';
      }
      if (!N && !S) {
        return 'r1';
      }
      return 'r2';
    };
    html = '';
    for (y = _i = 0, _ref = world.h - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
      for (x = _j = 0, _ref1 = world.w - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
        html += '<span id="mapx' + x + 'y' + y + '" ';
        tile = getTile(x, y);
        tileClass = [];
        tileStyle = '';
        if (tile.location) {
          tileClass.push(tile.location.type);
        } else if (tile.road) {
          tileClass.push(roadClass(tile));
        } else {
          shade = tile.height > 15 ? 15 : tile.height;
          water = shade + 2;
          if (tile.height < world.seaLevel) {
            color = water.toString(16) + water.toString(16) + 'f';
          } else {
            color = shade.toString(16) + 'f' + shade.toString(16);
          }
          tileStyle = 'style="background:#' + color + '"';
        }
        html += 'class="' + tileClass.join(' ') + '" ' + tileStyle + '></span>';
      }
      html += '<br/>';
    }
    el = document.createElement('div');
    el.innerHTML = '<div class="mapTiles">' + html + '</div>';
    el.className = 'map';
    el.style.maxWidth = window.innerWidth - 180;
    el.style.maxHeight = window.innerHeight;
    return el;
  };
});

// Generated by CoffeeScript 1.5.0-pre
