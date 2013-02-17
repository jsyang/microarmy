// Distance function, taking into account the terrain
define([
  'core/util/$'
], function($){
  var mapDistance = function(map, p1, p2) {
    if($.isUndefined(map)) {
      throw new Error('no terrain map given!');
    
    } else {
      var dist = 0;
    
      if(p2.x==p1.x) {
        // Vertical line.
        var x = p1.x;
        var y = p1.y;
        var lastHeight = _.map[y][x];
        
        if(p2.y>p1.y) {
          while(y<p2.y) {
            y++;
            dist+=_.map[y][x]-lastHeight+1;
          }
        } else {
          while(y>=p2.y) {
            y++;
            dist+=_.map[y][x]-lastHeight+1;
          }
        }
  
      } else {
        // Set p1 as left-most point
        if(p2.x<p1.x) {
          var p1_ = p2;
          p1 = p2;
          p2 = p1_;
        }
        
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        
        var dydy = dy/dx;
        
        var x = p1.x;
        var y = p1.y;
        var lastHeight = _.map[y][x];
        while(x<p2.x) {
          x++;
          y+=dydx;
          dist+=_.map[Math.round(y)][x]-lastHeight+1;
        }
      }   
      
      return dist;
    }    
  };
  
  return mapDistance;
});
    