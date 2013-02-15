
define(['core/util/$'], function($) {
  return function(_) {
    var chanceFill, dist, height, i, map, peak, peaks, x, y, _i, _len;
    _ = $.extend({
      numPeaks: $.R(24, 30),
      maxPeakHeight: 8,
      seaLevel: 4
    }, _);
    if ((_.w == null) || (_.h == null)) {
      throw new Error('width or height not set!');
    } else {
      map = (function() {
        var _i, _ref, _results;
        _results = [];
        for (y = _i = 0, _ref = _.h - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
          _results.push((function() {
            var _j, _ref1, _results1;
            _results1 = [];
            for (x = _j = 0, _ref1 = _.w - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
              _results1.push({
                x: x,
                y: y,
                height: 0,
                road: false
              });
            }
            return _results1;
          })());
        }
        return _results;
      })();
      peaks = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 1, _ref = _.numPeaks; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          _results.push({
            x: $.R(0, _.w - 1),
            y: $.R(0, _.h - 1),
            height: $.R(_.seaLevel, _.maxPeakHeight)
          });
        }
        return _results;
      })();
      chanceFill = function(x, y, height, distFromCenter) {
        var dx, dy, maxHeight, minHeight, _i, _j, _ref, _ref1, _ref2, _ref3;
        for (dy = _i = _ref = y - distFromCenter, _ref1 = y + distFromCenter; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; dy = _ref <= _ref1 ? ++_i : --_i) {
          for (dx = _j = _ref2 = x - distFromCenter, _ref3 = x + distFromCenter; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; dx = _ref2 <= _ref3 ? ++_j : --_j) {
            if ((Math.abs(dy - y) === distFromCenter || Math.abs(dx - x) === distFromCenter) && ((map[dy] != null) && (map[dy][dx] != null))) {
              minHeight = height < (_.maxPeakHeight >> 1) ? height : height - 1;
              maxHeight = height < (_.maxPeakHeight >> 1) ? height + 1 : height + 3;
              map[dy][dx].height += $.R(minHeight, maxHeight);
            }
          }
        }
      };
      for (_i = 0, _len = peaks.length; _i < _len; _i++) {
        peak = peaks[_i];
        dist = 0;
        height = peak.height;
        while (height > 0) {
          chanceFill(peak.x, peak.y, height, dist);
          height--;
          dist++;
        }
      }
      return $.extend({
        map: map,
        peaks: peaks
      }, _);
    }
  };
});

// Generated by CoffeeScript 1.5.0-pre