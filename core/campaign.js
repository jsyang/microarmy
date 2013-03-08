
define(['core/Behaviors', 'core/Behaviors/campaign', 'core/campaign/addTerrain', 'core/campaign/addLocations', 'core/campaign/addTransport', 'core/campaign/addExpansionLocations', 'core/campaign/addStorage', 'core/campaign/addResources', 'core/campaign/view/map', 'core/campaign/view/inventory', 'core/campaign/addUI'], function(Behaviors, CampaignBehaviors, Terrain, Locations, Transport, ExpandLocations, Storage, Resources, Map, Inventory, addUI) {
  var Campaign, views, worldBuilders;
  worldBuilders = [Terrain, Locations, Transport, ExpandLocations, Storage, Resources];
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
      this.Behaviors = new Behaviors(CampaignBehaviors);
    }

    Campaign.prototype.render = function() {
      var k, v;
      this.views = {};
      for (k in views) {
        v = views[k];
        this.views[k] = v(this._.world);
        document.body.appendChild(this.views[k]);
      }
      return this;
    };

    Campaign.prototype.cycle = function() {
      var x, y, _i, _j, _ref, _ref1;
      for (y = _i = 0, _ref = this._.h - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        for (x = _j = 0, _ref1 = this._.w - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          this.Behaviors.Execute(this.Behaviors.Trees.Tile, this._.world.map[y][x]);
        }
      }
      return this;
    };

    Campaign.prototype.addUI = addUI;

    return Campaign;

  })();
});

// Generated by CoffeeScript 1.5.0-pre
