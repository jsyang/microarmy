define([
  'preloader/preloader',
  'core/campaign',
  'core/campaign/storage'
], function(preloader, Campaign, Storage){

  window.preloader = preloader;

  var c = new Campaign;
  document.body.appendChild(c.render());

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