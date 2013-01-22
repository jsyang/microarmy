// Resources, currency, whatever you want to call it
// "virtual" and physical; the smallest unit of resource is an atom (only counted, does not itself exist as distinct resource)
define([
  'core/util/$',
  'core/util/Class',
  'core/campaign/resourceslist'
],function(Class, $, ResourceList){


  // uni

  // Resource synthesizer class
  return Class.extend({
    init : function(params) {
      this._ = $.extend({
        name  : '____ synthesizer',
        tech  : undefined,
        // auto synthesizes based on what's available (not in resource reserves)
        
      }, params);
    }



  });

  return Resource;
});