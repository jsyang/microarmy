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
    },
    render : function() { var _ = this._;
      // Renders terrain ONLY
      
      _.el.id = _.id;
      var innerHTML = '<table cellpadding=0 cellspacing=0>';
      for(var y=0; y<_.map.length; y++) {
        innerHTML += '<tr>';
        for(var x=0; x<_.map[y].length; x++) {
          var shade       = _.map[y][x]>15? 15 : _.map[y][x];
          // Inverting the shade value actually makes the landforms stand out more!
          var waterShade  = shade+2//5-shade; 
          var isWater     = shade < _.seaLevel;
          var color;
          
          if(isWater){
            color = waterShade.toString(16)+waterShade.toString(16)+'f';
          } else {
            color = shade.toString(16)+'f'+shade.toString(16);
          }
          
          var city = false;
          if($.r()<0.002) { city = '<img src="gfx/civiliancenter.png" width=16 height=16></div>'; }
          
          innerHTML += '<td style="background:#'+color+'">'+(city? city: shade)+'</td>';
        }
        innerHTML += '</tr>';
      }
      innerHTML += '</table>';
      
      _.el.innerHTML = innerHTML;
    }
  });
  
  return Map;
});
