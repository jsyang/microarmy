// Generate roads and other methods of transport between locations /////////////////////////////////////////////////////
define([
  'core/util/$',
  'core/Campaign/util/dist',
  'core/Campaign/util/cluster',
], function($, Class){
  var TransportGenerator = function(params) {
    var _ = $.extend({
      numLocations  : 10,
      percentCity   : 0.6,
      percentBase   : 0.4,
      
      // todo: generate location types too, not just simple city/base
      
      // base types
      //chanceSupplyBase      : 0.1,
      //chanceCommBase        : 0.2,
      //chanceProductionBase  : 0.4,
      //chanceFireBase        : 0.05,
      //chanceCitadel         : 0.07
      
      // City types
      //chanceIndustrialCity  : 0.2, // agriculture included?
      //chanceCommercialCity  : 0.4,
      //chanceResidentialCity : 0.3,
      //chanceAgriculturalCity: 0.5
      
    }, params);
    
    if($.isUndefined(_.map, _.locations)) {
      throw new Error('no generated terrain provided!');
    } else {
      var transport = [];
      
      for(var i)
      
      _.transport = transport;
      
      return _;
    }
  };
  
  return TransportGenerator;
});