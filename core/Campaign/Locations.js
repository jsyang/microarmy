// Generate initial locations of interest //////////////////////////////////////////////////////////////////////////////
define([
  'core/util/$'
], function($, Class){
  var LocationGenerator = function(params) {
    var _ = $.extend({
      numLocations  : 10,
      percentCity   : 0.6,
      percentBase   : 0.4,
      
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
    
    if($.isUndefined(_.map, _.peaks)) {
      throw new Error('no generated terrain provided!');
    } else {
      
      // todo: use peaks as starting points for cities, then add bases near cities.
      // unless it's a firebase or a citadel.
      
      
      return _;
    }
  };
  
});