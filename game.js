// Run the game.
define([
  
  'preloader/preloader',
  'core/util/XHash'
  
], function(preloader, XHash){
  
  window.preloader = preloader;
  
  /* done loading everything! wait a sec.
      this is a module, don't do anything yet
      with the loaded stuff
      
    loader.onfinish=function() {        
      world=new Battle();
      world.initWorld();
      world.go();
    };
    
    */
});