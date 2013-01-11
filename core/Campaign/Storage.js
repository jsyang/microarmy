// Storage "trait" for facilities / massive units
define([
  'core/util/Class',
  'core/util/$'
],function(Class, $){
  
  var Storage = Class.extend({
    
    init : function(params) {
      this._ = $.extend({
        spaceRemaining  : 10,
        contents        : []
      }, params);
    },
    
    // todo: sort these based on class type..
    
    add : function(stuff) { var _ = this._;
      if(!(stuff instanceof Array)) { stuff = [ stuff ]; }
      
      var totalSize = 0;
      stuff.forEach(function(v){
        var size = 1;
        // Not perishable; AKA we can store this outside of battles.
        if(v instanceof Class && v._.durable) {
          size = v._.durable.size;
        }
        
        totalSize += size;
      });
      
      if(totalSize>_.spaceRemaining) {
        return false;
      } else {
        _.spaceRemaining -= totalSize;
        _.contents = _.contents.concat(stuff);
        return true;
      }
    },
    
    remove : function() { var _ = this._;
      $$.toArray(arguments).forEach(function(v){
        var size = 1;
        // Not perishable; AKA we can store this outside of battles.
        if(v instanceof Class && v._.durable) {
          size = v._.durable.size;
        }
        
        _.spaceRemaining += size;
        _.contents[ _.contents.indexOf(v) ] = undefined;
      });
      
      // Remove the undefined values!
      _.contents = $$.compact(_.contents);
    }
    
  });
  
  return Storage;
});