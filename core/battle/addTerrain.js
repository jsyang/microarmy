// Generated by CoffeeScript 1.4.0

define(['core/util/$', 'core/battle/testSector'], function($, testSectors) {
  var makeHeightMap, makePeaks, params;
  params = {
    sectorW: 1024,
    sectorHeightMult: 18,
    peakMarginMin: 32,
    peakMarginMax: 128,
    peakDev: 32,
    peakMinH: 16
  };
  makePeaks = function(sector, i) {
    var peaks, sectorMinH, sectorMinX, x;
    peaks = [];
    sectorMinX = i * params.sectorW;
    sectorMinH = (sector.height * params.sectorHeightMult) + params.peakMinH;
    x = $.R(params.peakMarginMin, params.peakMarginMax);
    while (x < params.sectorW) {
      peaks.push({
        height: sectorMinH + $.R(0, params.peakDev),
        x: sectorMinX + x
      });
      x += $.R(params.peakMarginMin, params.peakMarginMax);
    }
    return peaks;
  };
  makeHeightMap = function(sectors, battleW, battleH) {
    var dh, h, heightmap, i, peak, peaks, sector, x, _i, _j, _len, _len1;
    h = sectors[0].height * params.sectorHeightMult + params.peakMinH;
    heightmap = [];
    peaks = [];
    i = 0;
    for (_i = 0, _len = sectors.length; _i < _len; _i++) {
      sector = sectors[_i];
      peaks = peaks.concat(makePeaks(sector, i));
      i++;
    }
    x = 0;
    for (_j = 0, _len1 = peaks.length; _j < _len1; _j++) {
      peak = peaks[_j];
      dh = (peak.height - h) / (peak.x - x);
      while (x !== peak.x) {
        heightmap.push(Math.round(battleH - h));
        h += dh;
        x++;
      }
    }
    if (x < battleW) {
      h = Math.round(h);
      while (x < battleW) {
        heightmap.push(Math.round(battleH - h));
        x++;
      }
    }
    return heightmap;
  };
  return function(_) {
    if ((_.w != null) && (_.h != null)) {
      _.heightmap = makeHeightMap(testSectors, _.w, _.h);
    } else {
      throw new Error('width or height not set!');
    }
    return _;
  };
});
