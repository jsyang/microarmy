// Preload stuff ///////////////////////////////////////////////////////////////

preloader=(function() {    
  // 1. Preload gfx
  var a=new html5Preloader();  
  var i="";  
  var u= // team-neutral stuff
    'shells,missilered,exp1,exp2,exp2big,smoke,scaffold_,pillbox_'
  .split(',');
  
  for(var j=0; j<u.length; j++)
    i+=';'+u[j]+'*:gfx/'+u[j]+'.png';
  
  var u=( // stuff that has team-unique gfx
    'pistol,rocket,engineer,'+
    'apc,'+
    'comm,pillbox,barracks,turret,depot,repair,helipad,scaffold'
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
    
    // [MUSIC CODE HERE] -- removed for now..
    
  });
    
  // 3. Create the gameworld with map entities and run it!
  world=new World();
  Generate.TEAM(TEAM.BLUE);
  Generate.TEAM(TEAM.GREEN);
  world.go();

};

////////////////////////////////////////////////////////////////////////////////

var MOUSEMODE={
  EXPLOSION:0,
  APC:1,
  
  NONE:Infinity
};

var mode=MOUSEMODE.NONE;

window.onkeydown=function(e){
  if(e.which<48 || e.which>58) return;
  mode=e.which-49;
  for(var i in MOUSEMODE)
    if(MOUSEMODE[i]==mode) break;
  console.log("Click = "+i);
};

// BOOM! HEH.
window.onclick=function(e){
  var x=e.pageX, y=e.pageY;
  var a;
  switch(mode) {
    case MOUSEMODE.APC: a=new APC(x,world.getHeight(x),TEAM.BLUE); break;
    case MOUSEMODE.EXPLOSION: a=new SmallExplosion(x,y); break;
    case MOUSEMODE.NONE:
  }
  
  //var eng=new EngineerInfantry(x,world.getHeight(x),TEAM.BLUE);
  //eng._.build.type=Pillbox;
  //eng._.build.x=500;
  world.addPawn(a);
};

var poo;
//window.ondblclick=function(e){  console.log(e.pageX); };
