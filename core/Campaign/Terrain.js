// Generate Terrain for the Campaign ///////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$'
], function($, Class){
  var TerrainGenerator = function(params) {
    var _ = $.extend({
      numPeaks      : $.R(12,20),     // peaks = seeds for terrain generation
      maxPeakHeight : 12,             // 15
      
      seaLevel      : 5               // 0 = deepest sea level, 5 = beach
    }, params);
    
    if($.isUndefined(_.w, _.h)) {
      throw new Error('width or height not given to TerrainGenerator');
    } else {
      // 2d --> w * h
      for(var map=[], i=0; i<_.h; i++) {
        for(var row=[], j=0; j<_.w; j++) { row.push(0); }
        map.push(row);
      }
      
      // Generate the peaks
      var peaks = [];
      for(var i=_.numPeaks; i--;){
        peaks.push({
          x       : $.R(0, _.w-1),
          y       : $.R(0, _.h-1),
          height  : $.R(_.seaLevel, _.maxPeakHeight)
        });
      }
      
      // Draw a lossy box around the peak
      function chanceFill(x, y, height, distFromCenter) {
        for(var dy=y-distFromCenter; dy<=y+distFromCenter; dy++) {
          for(var dx=x-distFromCenter; dx<=x+distFromCenter; dx++) {
            if(Math.abs(dy-y) == distFromCenter ||
               Math.abs(dx-x) == distFromCenter
            ){
              // box lines.
              if(!$.isUndefined(map[dy]) && !$.isUndefined(map[dy][dx])) {
                var minHeight = height<7? height : height-1;
                var maxHeight = height<7? height+1 : height+5;
                map[dy][dx] += $.R(minHeight, maxHeight);
              }
            }
          }
        }
      }
      
      // Use the peaks as seeds to generate mounds in the terrain
      peaks.forEach(function(peak){
        var dist = 0;
        while(peak.height>0) {
          chanceFill(peak.x, peak.y, peak.height, dist);
          peak.height--;
          dist++;
        }
      });
      
      return map;
    }
  };
  
  return TerrainGenerator;
});