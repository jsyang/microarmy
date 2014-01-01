define(
  [
    'lib/preloader/html5Preloader',
    'text!core/RESOURCES_GFX.txt',
    'text!core/RESOURCES_SND.txt'
  ],
  
  // jsyang: basically never have to touch this.
  function(html5Preloader, RESOURCES_GFX, RESOURCES_SND) {
  
    return function(success) {
        var loader = new html5Preloader();
        
        RESOURCES_GFX = RESOURCES_GFX.split('\n');
        RESOURCES_GFX.forEach(
          function(v,i,a) {
            if(v.length) {
              a[i] = v+'*:gfx/'+v+'.png';
            }
          }
        );
        
        loader.addFiles.apply(loader, RESOURCES_GFX);
    
        window.soundManager.onready(function() {
          window.soundManager.defaultOptions.volume = 45;
          RESOURCES_SND = RESOURCES_SND.split('\n');
          RESOURCES_SND.forEach(function(v) {
            if(v.length) {
              window.soundManager.createSound(v,'./snd/'+v);
            }
          });
        });
    
        loader.onfinish = success;
        
        return loader;
    };
    
  }
);
