
define(['core/util/$', 'core/campaign/addTerrain', 'core/campaign/addLocations', 'core/campaign/addTransport', 'core/campaign/addStorage', 'core/campaign/addResources', 'core/campaign/view/map', 'core/campaign/view/inventory', 'core/campaign/addUI'], function($, Terrain, Locations, Transport, Storage, Resources, Map, Inventory, addUI) {
  var Campaign, views, worldBuilders;
  worldBuilders = [Terrain, Locations, Transport, Storage, Resources];
  views = {
    Map: Map,
    Inventory: Inventory
  };
  return Campaign = (function() {

    function Campaign(_) {
      var addTo, world, _i, _len;
      this._ = $.extend({
        w: 36,
        h: 24
      }, _);
      world = this._;
      for (_i = 0, _len = worldBuilders.length; _i < _len; _i++) {
        addTo = worldBuilders[_i];
        world = addTo(world);
      }
      this._.world = world;
    }

    Campaign.prototype.render = function() {
      var k, v;
      this.views = {};
      for (k in views) {
        v = views[k];
        this.views[k] = v(this._.world);
      }
      return this;
    };

    Campaign.prototype.addUI = addUI;

    return Campaign;

  })();
});

// Generated by CoffeeScript 1.5.0-pre
