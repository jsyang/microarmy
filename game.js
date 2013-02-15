define([
  'preloader/preloader',
  'core/campaign'
], function(preloader, Campaign){

  window.preloader = preloader;

  var c   = new Campaign;
  var el  = c.render();
  var ui  = c.ui(el);
  document.body.appendChild(el);

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