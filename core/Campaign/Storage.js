// Storage "trait" for locations
define([
  'core/util/Class',
  'core/util/$'
],function(Class, $){
  return Class.extend({

    // todo: decaying items in tiles
    // we can skip checking ALL tiles per turn
    // just count up the turns since last check
    // check only if there are things that are alive in that tile.
    

    init : function(params) {
      this._ = $.extend({
        turnsSinceLastPoll      : 0,      // How many campaign turns has it been since we last tried to decay contents?
        decayRate               : 10,     // How fast do random things to discard per turn? (for non-storage locations)
        size                    : 1000,   // how much space do we have left?
        contents                : []
      }, params);
      
      this._.spaceRemaining = this._.size;
    },

    // todo: sort these based on class type..

    getByType : function(typeName) {
      // todo.
      return $$.pluck(this.contents, typeName);
    },

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
});