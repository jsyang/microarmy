// Generate roads and other methods of transport between locations /////////////////////////////////////////////////////
define([
  'core/util/$'
], function($){
  var TransportGenerator = function(params) {
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
    
    if($.isUndefined(_.map, _.locations)) {
      throw new Error('no generated terrain provided!');
    } else {
      var transport = [];
      
      // todo: convert tiles into objects rather than ints
      var setTileRoad = function(tile) {
        if(tile.height>=_.seaLevel)
          tile.isRoad = true;
      };
      
      var makeRoute = function(c,d) {
        // Set a as left-most point
        var a = d.x<c.x? d : c;
        var b = d.x<c.x? c : d;
      
        var dx = a.x<b.x? 1 : -1;
        var dy = a.y<b.y? 1 : -1;
        
        if(a.x == b.x) {
          for(var y=a.y+dy; y!=b.y; y+=dy) {
            if(_.map[y][a.x]>=_.seaLevel)
              _.map[y][a.x] = 255;
          }
        } else if(a.y == b.y) {
          for(var x=a.x+dx; x!=b.x; x+=dx) {
            if(_.map[a.y][x]>=_.seaLevel)
              _.map[a.y][x] = 255;
          }
        } else {
          var ySplit = dy>0? $.R(a.y,b.y) : $.R(b.y,a.y);
          /*
          
              A
              |
              |
                          |
                          |
                          B
          
          */
          if(dy>0) {            
            for(var y=a.y+dy; y<ySplit; y+=dy) { 
              if(_.map[y][a.x]>=_.seaLevel)
                _.map[y][a.x] = 255; 
            }
            for(var y=b.y-dy; y>=ySplit; y-=dy) { 
              if(_.map[y][b.x]>=_.seaLevel)
                _.map[y][b.x] = 255; 
            }
          } else {
            for(var y=a.y+dy; y>ySplit; y+=dy) { 
              if(_.map[y][a.x]>=_.seaLevel)
                _.map[y][a.x] = 255; 
            }
            for(var y=b.y-dy; y<=ySplit; y-=dy) { 
              if(_.map[y][b.x]>=_.seaLevel)
                _.map[y][b.x] = 255; 
            }
          }
          
          /*
          
              A
              |
              |___________
                          |
                          |
                          B
          
          */
          for(var x=a.x; x<b.x; x+=dx) { 
            if(_.map[ySplit][x]>=_.seaLevel)
              _.map[ySplit][x] = 255; 
          }
        }
      };
      
      /*
        for(var i=_.peaks.length; i--;) {
        var regionLocations = $$.filter(
          _.locations, 
          function(l) { return l.peak == _.peaks[i]; }
        );
      */
        var regionLocations = _.locations;
        
        if(regionLocations.length>1) {
          
          // Connect all the locations in a region, hap-hazardly
          regionLocations.forEach(function(v) {
            // 66% chance of road generation.
            if($.R(0,2)) {              
              var nextDot = $.pickRandom(
                $$.without(regionLocations, v)
              );
              
              makeRoute(v, nextDot);
            }
          });
        }
      
      //}
      
      _.transport = transport;
      
      return _;
    }
  };
  
  return TransportGenerator;
});