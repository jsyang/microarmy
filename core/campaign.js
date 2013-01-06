// Campaign -- strategy side ///////////////////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/util/Class',
  'core/Campaign/Terrain'
],function($, Class, CampaignTerrain){
  
  var Campaign = Class.extend({
    init : function(params) {
      this._ = $.extend({
        w : 48,
        h : 48
      }, params);
      
      // Layer upon layer.
      this._.terrain = new CampaignTerrain(this._);
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