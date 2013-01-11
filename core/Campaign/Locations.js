// Generate initial locations of interest //////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$'
], function($, Class){
  var LocationGenerator = function(params) {
    var _ = $.extend({
      numLocations  : 10,
      percentCity   : 0.6,
      percentBase   : 0.4,
      
      // todo: generate location types too, not just simple city/base
      
      // base types
      //chanceSupplyBase      : 0.1,
      //chanceCommBase        : 0.2,
      //chanceProductionBase  : 0.4,
      //chanceFireBase        : 0.05,
      //chanceCitadel         : 0.07
      
      // City types
      //chanceIndustrialCity  : 0.2, // agriculture included?
      //chanceCommercialCity  : 0.4,
      //chanceResidentialCity : 0.3,
      //chanceAgriculturalCity: 0.5
      
    }, params);
    
    if($.isUndefined(_.map, _.peaks)) {
      throw new Error('no generated terrain provided!');
    } else {
      var locations = [];
      
      function dist2(p1, p2) {
        if($.isUndefined(p1, p2)) return 0;
        var dx = p2.x- p1.x;
        var dy = p2.y- p1.y;
        return dx*dx + dy*dy;
      }
      
      var distThreshold = _.w * _.h * 0.6;
      var lastPeak;
      while(locations.length < _.numLocations) {
        var origin = _.peaks[$.R(0,_.peaks.length-1)];
        var foundOrigin = false;
        for(var trying=3; trying--;) {
          if(dist2(lastPeak, origin)<distThreshold) {
            foundOrigin = true;
            break;
          }
        }
        
        if(foundOrigin) {
          var tx  = (_.w*0.3)*($.r()-$.r());
          var ty  = (_.h*0.3)*($.r()-$.r());
          var x   = origin.x;
          var y   = origin.y;
          
          // 10 tries per location origin.
          for(var j=10; j--;) {
            var suitableLocation = undefined;
            // Move and floor the potential location's coords
            x += tx;  x >>= 0;
            y += ty;  y >>= 0;
            
            if($.r()<_.percentCity) {
              suitableLocation = { type : 'city' };
              
            } else if($.r()<_.percentBase && j>7) {
              // don't make a base if we're too far away
              suitableLocation = { type : 'base' };
            }
            
            if(suitableLocation) {
              if($.isUndefined(_.map[y]) || $.isUndefined(_.map[y][x])) {
              } else {
                if(_.map[y][x] >= _.seaLevel) {
                  // Only build stuff that's on land...
                  // todo: offshore rigs?
                  
                  suitableLocation.x = x;
                  suitableLocation.y = y;
                  suitableLocation.peak = origin;
                  locations.push(suitableLocation);
                  break;
                }
              }
            }
          }
          
          lastPeak = origin;
        }
        
        distThreshold *= 0.98;
      }
      
      _.locations = locations;
      
      return _;
    }
  };
  
  return LocationGenerator;
});