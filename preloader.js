preloader=(function() {    
  // 1. Preload gfx
  var a=new html5Preloader();  
  var i="";  
  var u=( // team-neutral stuff
    'shells,exp0,exp1,exp2,exp2big,'+
	'smoke,smokesmall,'+
    'scaffold_,pillbox_,missilerack_,'+
    'missilepurple,missilered,'+
    'firesmall0,firesmall1,firesmall2,'+
	'firemedium0,firemedium1'
  ).split(',');
  
  for(var j=0; j<u.length; j++)
    i+=';'+u[j]+'*:gfx/'+u[j]+'.png';
  
  var u=( // stuff that has team-unique gfx
    'pistol,rocket,engineer,'+
    'apc,'+
    'mine,'+
    'ammodump,ammodumpsmall,'+
    'watchtower,'+
    'missilerack,missileracksmall,'+
    'comm,pillbox,barracks,turret,depot,repair,helipad,'+
    'scaffold,relay'
  ).split(',');
  
  for(var j=0; j<u.length; j++)
    for(var k=0; k<TEAM.MAX; k++)
      i+=';'+u[j]+TEAM.NAMES[k]+'*:gfx/'+u[j]+k+'.png';
    
  a.addFiles.apply(a,i.split(';'));  
  return a;

})();

preloader.onfinish=function() {  
  // 2. Preload sfx/music
  soundManager.onready(function() {
    soundManager.defaultOptions.volume = 15;
    var list=(
      'pistol,mgburst,rocket,die1,die2,die3,die4,'+
      'expsmall,expfrag,accomp,crumble,sliderack1,'+
      'tack,exp2big,missile1,turretshot,feed'
    ).split(',');
    for(var i=list.length; i--;)
      soundManager.createSound(list[i],'./snd/'+list[i]);
  });
    
  // 3. Create the gameworld with map entities and run it!
  
  world=new Battle();
  world.initWorld();
  world.go();
};

