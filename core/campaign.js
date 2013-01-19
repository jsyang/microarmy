// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/Class',
  'core/Campaign/Terrain',
  'core/Campaign/Locations',
  'core/Campaign/Transport'
],function($, Class, CampaignTerrain, CampaignLocations, CampaignTransport){

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
        CampaignTerrain,
        CampaignLocations,
        CampaignTransport
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
    }
  });

});