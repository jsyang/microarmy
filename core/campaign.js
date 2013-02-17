// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/class',
  'core/Campaign/addTerrain',
  'core/Campaign/addLocations',
  'core/Campaign/addTransport',
  'core/Campaign/addStorage',
  'core/Campaign/addResources',
  
  'core/Campaign/MapView'
],function($, Class, Terrain, Locations, Transport, Storage, Resources, MapView){

  return Class.extend({
    init : function(params) {
      this._ = $.extend({
        w : 48,
        h : 24
      }, params);

      var _ = this._;

      // Layer upon layer.
      var world = _;
      [

        Terrain,
        Locations,
        Transport,
        Storage,
        Resources

      ].forEach(
        function(additiveGenerator){ world = additiveGenerator(world); }
      );

      _.world = world;

      // this._.foliage = ...
      // this._.cities = ...
      // this._.mines = ...
      // this._. = ...
    },

    render : MapView,

    ui : function(el) { var _ = this._;
      el.onclick = function(e){
        var x = (e.pageX * 0.041666667)>>0;
        var y = (e.pageY * 0.041666667)>>0;
        var tile = _.world.map[y][x]
        
        var tileDescription = tile.height < _.world.seaLevel? 'water' : 'land';
        var tileLocation = tile.location? 'has a ' + tile.location.type + ' and' : '';
        
        console.log(tileDescription, 'at', [x, y], tileLocation, 'contains:\n', tile.store.printContents());
      }
    }
  });
});