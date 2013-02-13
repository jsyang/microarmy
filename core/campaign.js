// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/class',
  'core/Campaign/addTerrain',
  'core/Campaign/addLocations',
  'core/Campaign/addTransport',
  'core/Campaign/addStorage',
  
  'core/Campaign/MapView'
],function($, Class, Terrain, Locations, Transport, Storage, MapView){
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
        Storage

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

    ui : undefined  // user interaction controller here.
  });
});