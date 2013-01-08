define([
  
  'preloader/preloader',
  'core/Campaign',
  'core/Campaign/Map',
  //'core/util/XHash',
  //'core/Behavior/Battle/Trees'
  
], function(preloader, Campaign, CampaignMap){
  
  window.preloader = preloader;
  
  var c = new Campaign;
  var m = new CampaignMap(c._.world);
  
  document.body.appendChild(m._.el);
  m.render();
  
  console.log(c._.world);
  
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