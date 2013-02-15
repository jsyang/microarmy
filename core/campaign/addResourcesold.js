// Resources, currency, whatever you want to call it
// "virtual" and physical; the smallest unit of resource is an atom (only counted, does not itself exist as distinct resource)
define([
  'core/util/$',
  'core/Resources/Campaign'
],function($, CampaignResources){
  var addResources = function(params) {
    var _ = params;

    for(var i=_.locations.length; i-->0;) {
      var loc = _.locations[i];
      var randomResources = $$.pairs(CampaignResources);
      randomResources = $$.shuffle(randomResources);
      var random3 = {};
      for(var j=3; j-->0;) {
        random3[randomResources[j][0]] = $.R(1,30);
      }
      _.map[loc.y][loc.x].store.add(random3);
    }

    return _;
  };

  return addResources;

});
