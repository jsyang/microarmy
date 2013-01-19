// Generate roads and other methods of transport between locations
define([
  'core/util/$'
], function($){ return function(params) {
  var _ = $.extend({
    numLocations  : 10,
    percentCity   : 0.6,
    percentBase   : 0.4,

    /* todo: generate different transport types, not just roads
      gravel / dirt road,
      rail,
      high speed rail,
      monorail (fastest?),

    */
  }, params);

  if($.isUndefined(_.map, _.locations)) {
    throw new Error('no terrain / locations given!');

  } else {
     var setTileRoad = function(tile) {
      if(tile.height>=_.seaLevel) {
        tile.road = true;
        return true;
      } else {
        return false;
      }
    };

    var makeRoute = function(c,d) {
      // Set a as left-most point
      var a = d.x<c.x? d : c;
      var b = d.x<c.x? c : d;

      var dx = a.x<b.x? 1 : -1;
      var dy = a.y<b.y? 1 : -1;

      if(a.x == b.x) {
        for(var y=a.y; y!=b.y; y+=dy) { if(!setTileRoad(_.map[y][a.x])) break; }

      } else if(a.y == b.y) {
        for(var x=a.x; x!=b.x; x+=dx) { if(!setTileRoad(_.map[a.y][x])) break; }

      } else {
        /*
          Xsplit            A----|
                                 | <--------- split on x
                                 |
                                 |----B

          Ysplit            A
                            |__________ <---- split on y
                                      |
                                      B
        */
        if($.R(0,1)) {
          var xSplit = dx>0? $.R(a.x,b.x) : $.R(b.x,a.x);

          if(dx>0) {
            for(var x=a.x+dx; x <xSplit; x+=dx) { if(!setTileRoad(_.map[a.y][x])) break; }
            for(var x=b.x-dx; x>=xSplit; x-=dx) { if(!setTileRoad(_.map[b.y][x])) break; }
          } else {
            for(var x=a.x+dx; x >xSplit; x+=dx) { if(!setTileRoad(_.map[a.y][x])) break; }
            for(var x=b.x-dx; x<=xSplit; x-=dx) { if(!setTileRoad(_.map[b.y][x])) break; }
          }
            for(var y=a.y; y<b.y; y+=dy)        { if(!setTileRoad(_.map[y][xSplit])) break; }

        } else {
          var ySplit = dy>0? $.R(a.y,b.y) : $.R(b.y,a.y);

          if(dy>0) {
            for(var y=a.y+dy; y <ySplit; y+=dy) { if(!setTileRoad(_.map[y][a.x])) break; }
            for(var y=b.y-dy; y>=ySplit; y-=dy) { if(!setTileRoad(_.map[y][b.x])) break; }
          } else {
            for(var y=a.y+dy; y >ySplit; y+=dy) { if(!setTileRoad(_.map[y][a.x])) break; }
            for(var y=b.y-dy; y<=ySplit; y-=dy) { if(!setTileRoad(_.map[y][b.x])) break; }
          }
            for(var x=a.x; x<b.x; x+=dx) { if(!setTileRoad(_.map[ySplit][x])) break; }
        }

      }
    };

    var allLocs = _.locations;

    if(allLocs.length>1) {
      // Connect all the locations hap-hazardly
      allLocs.forEach(function(loc) {
        // 66% chance of road generation.
        if($.R(0,2)) {
          var nextLoc = $.pickRandom(
            $$.without(allLocs, loc)
          );

          makeRoute(loc, nextLoc);
        }
      });
    }

    return _;
  }

}; });