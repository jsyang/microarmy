// Campaign map view ///////////////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/Class',
  'core/util/$'
],function(Class, $){
  // todo: draw the map onto the canvas and return the map gui object
  var Map = Class.extend({
    
    init : function(params) {
      this._ = $.extend({
        id : 'map',
        el : document.createElement('div')
      },params);
      
      this._.el.id = this._.id;
    },
        
    render : function() { var _ = this._;
      // Renders terrain ONLY
      var locations = _.locations.slice();
      
      var innerHTML = '<table cellpadding=0 cellspacing=0>';
      for(var y=0; y<_.map.length; y++) {
        innerHTML += '<tr>';
        for(var x=0; x<_.map[y].length; x++) {
        
          var shade       = _.map[y][x]>15? 15 : _.map[y][x];
          var isRoad      = false;
          if(_.map[y][x]==255) {
            isRoad = true;
          }
          
          var waterShade  = shade+2;
          var isWater     = shade < _.seaLevel;
          var isLocation  = undefined;
          var color;
          if(isRoad){
            color = '333';
          } else if(isWater){
            color = waterShade.toString(16)+waterShade.toString(16)+'f';
          } else {
            color = shade.toString(16)+'f'+shade.toString(16);
          }
          
          locations.forEach(function(v){
            if(v.x==x && v.y==y) {
              isLocation = v;
            }
          });
          innerHTML += '<td id="mapx'+x+'y'+y+'" style="background:#'+color+'">';
          
          // Display locations
          if(isLocation) {
            innerHTML += '<span class="map_'+isLocation.type+'">'+isLocation.type[0]+'</span>';
          } else {
            innerHTML += shade;
          }
          
          innerHTML += '</td>';
        }
        innerHTML += '</tr>';
      }
      innerHTML += '</table>';
      
      _.el.innerHTML = innerHTML;
    }
  });
  
  return Map;
});
