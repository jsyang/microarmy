define([

  'preloader/preloader',
  'core/Campaign',
  'core/Campaign/Map',
  'core/Campaign/Storage'
  
], function(preloader, Campaign, CampaignMap, Storage){

  window.preloader = preloader;

  var c = new Campaign;
  var m = new CampaignMap(c._.world);

  document.body.appendChild(m._.el);
  m.render();

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