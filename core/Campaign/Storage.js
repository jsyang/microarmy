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
        contents                : {}
      }, params);
      
      this._.spaceRemaining = this._.size;
    },

    // todo: sort these based on class type..

    add : function(stuffObj) { var _ = this._;
      // can only add resources in here.
      var totalSize = 0;
      for(var name in stuffObj) {
        var resource = stuffObj[name];
        var size = resource.size || 1;
        totalSize += size;
      }

      if(totalSize>_.spaceRemaining) {
        return false;
      } else {
        _.spaceRemaining -= totalSize;
        
        for(var name in stuffObj) {
          var resource = stuffObj[name];
          if(name in _.contents) {
            _.contents[name] += resource;
          } else {
            _.contents[name] = resource;
          }
        }
        
        return true;
      }
    },

    remove : function(stuffObj) { var _ = this._;
      for(var name in stuffObj) {
        var resource = stuffObj[name];
        var size = resource.size || 1;
        
        if(name in _.contents) {
          if(_.contents[name] - resource>=0) {
            _.contents[name] -= resource;
            
          } else {
            resource = _.contents[name];
            delete _.contents[name];
          }
          
          _.spaceRemaining += size * resource;
        }
      }
    },
    
    has : function(name) {
      return name in this._.contents;
    },
    
    printContents : function() { var _ = this._;
      var text  = '';
      var qty   = 0;
      for(var name in _.contents) {
        qty++;
        text += _.contents[name] + ' x ' + name + '\n';
      }
      
      return qty? text : 'nothing';
    }

  });
});