define(
  [
    'html5preloader/html5Preloader',
    'text!RESOURCES_GFX.txt',
    'text!RESOURCES_SND.txt'
  ],
  
  function(html5Preloader, RESOURCES_GFX, RESOURCES_SND) {
    var loader  = new html5Preloader();
    
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
      window.soundManager.defaultOptions.volume = 15;
      RESOURCES_SND = RESOURCES_SND.split('\n');
      RESOURCES_SND.forEach(function(v) {
        if(v.length) {
          window.soundManager.createSound(v,'./snd/'+v);
        }
      });
    });

    /* done loading everything! wait a sec.
      this is a module, don't do anything yet
      with the loaded stuff
      
    loader.onfinish=function() {        
      world=new Battle();
      world.initWorld();
      world.go();
    };
    
    */
    window.loader = loader;
    return loader;
  }
);
