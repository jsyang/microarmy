// Storage "trait" for locations
define([
  'core/util/$',
  'core/Campaign/Storage',
],function($, Storage){
  var addStorage = function(params) {
    var _ = params;
    var storageSettings = {
      water : {
        size      : 0,
        decayRate : 40
      },
      land : {
        size      : 1000,
        decayRate : 10
      },
      city : {
        size      : 1600,
        decayRate : 2
      },
      base : {
        size      : 3000,
        decayRate : 0
      }
    };    
    
    for(var y=_.h; y-->0;) {
      for(var x=_.w; x-->0;) {
        var tile = _.map[y][x];
        var settings;
        
        if(tile.location) {
          settings = storageSettings[tile.location.type];
          
        } else {
          settings = (tile.height < _.seaLevel)? storageSettings.water : storageSettings.land;
        }
        
        tile.store = new Storage(settings);
      }
    }
    
    return _;
  };
  
  return addStorage;
});