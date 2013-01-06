// Campaign map view ///////////////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/Class',
  'core/util/$'
],function(Class, $){
  // todo: draw the map onto the canvas and return the map gui object
  var Map = Class.extend({
    init : function(params) {
      this._ = $.extend({
        id : 'map'+$.r(),
        el : document.createElement('div')
      },params);
    },
    render : function() { var _ = this._;
      // Renders terrain ONLY
      _.el.id = _.id;
      var innerHTML = '<table cellpadding=0 cellspacing=0>';
      for(var y=0; y<_.terrain.length; y++) {
        innerHTML += '<tr>';
        for(var x=0; x<_.terrain[y].length; x++) {
          var shade       = _.terrain[y][x]>15? 15 : _.terrain[y][x];
          // Inverting the shade value actually makes the landforms stand out more!
          var waterShade  = 5-shade; 
          var isWater     = shade < 4;
          var color;
          
          if(isWater){
            color = waterShade.toString(16)+''+waterShade.toString(16)+'f';
          } else {
            color = shade.toString(16)+'f'+shade.toString(16);
          }
          
          innerHTML += '<td style="background:#'+color+'"></td>';
        }
        innerHTML += '</tr>';
      }
      innerHTML += '</table>';
      
      _.el.innerHTML = innerHTML;
    }
  });
  
  return Map;
});
