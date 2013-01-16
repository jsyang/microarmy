// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/Class',
  'core/Campaign/Terrain',
  'core/Campaign/Locations',
  'core/Campaign/Transport'
],function($, Class, CampaignTerrain, CampaignLocations, CampaignTransport){
  
  var Campaign = Class.extend({
    init : function(params) {
      this._ = $.extend({
        w : 56,
        h : 32
      }, params);
      
      var _ = this._;
      
      // Layer upon layer.
      var world = _;

      [
        CampaignTerrain,
        CampaignLocations,
        CampaignTransport
      ].forEach(
        function(v){ world = v(world); }
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
  
  return Campaign;

});