// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/class',
  'core/campaign/terrain',
  'core/campaign/locations',
  'core/campaign/transport',
  'core/campaign/resources',
  'core/campaign/mapview'
],function($, Class, Terrain, Locations, Transport, Resources, MapView){
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
        Transport

      ].forEach(
        function(additiveGenerator){ world = additiveGenerator(world); }
      );

      _.world = world;

      // this._.foliage = ...
      // this._.cities = ...
      // this._.mines = ...
      // this._.bases = ...
      // this._.roads = ...
      // this._. = ...
    },

    render : MapView,

    ui : undefined  // user interaction controller here.
  });
});