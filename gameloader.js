// Pick a random map: background + terrain + entities //////////////////////////

function mapPickRandom() {
  var m=[
    
    { name: 'spring', entities: [
        { obj: CommCenter, team: TEAM.BLUE, x: 526 },
        { obj: Barracks, team: TEAM.BLUE, x: 479 },
        { obj: Pillbox, team: TEAM.BLUE, x: 642 },
        
        { obj: CommCenter, team: TEAM.GREEN, x: 1892 },
        { obj: Barracks, team: TEAM.GREEN, x: 1832 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1635 },
    ]},
    
    { name: 'afghan', entities: [
        { obj: CommCenter, team: TEAM.BLUE, x: 492 },
        { obj: Barracks, team: TEAM.BLUE, x: 610 },
        { obj: Pillbox, team: TEAM.BLUE, x: 696 },
        { obj: Pillbox, team: TEAM.BLUE, x: 1089 },
        
        { obj: CommCenter, team: TEAM.GREEN, x: 2394 },
        { obj: Barracks, team: TEAM.GREEN, x: 2307 },
        { obj: SmallTurret, team: TEAM.GREEN, x: 2148 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1945 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1482 },
    ]},
    
    { name: 'egypt', entities: [
        { obj: CommCenter, team: TEAM.BLUE, x: 123 },
        { obj: Barracks, team: TEAM.BLUE, x: 404 },
        { obj: Pillbox, team: TEAM.BLUE, x: 626 },
        
        { obj: CommCenter, team: TEAM.GREEN, x: 2456 },
        { obj: Barracks, team: TEAM.GREEN, x: 2192 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1884 },
    ]},
    
    { name: 'chechnya', entities: [
        { obj: CommCenter, team: TEAM.BLUE, x: 26 },
        { obj: Barracks, team: TEAM.BLUE, x: 201 },
        { obj: Pillbox, team: TEAM.BLUE, x: 256 },
        { obj: Pillbox, team: TEAM.BLUE, x: 753 },
        
        { obj: CommCenter, team: TEAM.GREEN, x: 2078 },
        { obj: Barracks, team: TEAM.GREEN, x: 2000 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1814 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1541 },
    ]}
    
  ]; return m[$.R(0,m.length-1)];
}

var map=mapPickRandom();

// Preload stuff ///////////////////////////////////////////////////////////////

var preloader=(function() {    
  // 1. Preload gfx
  var a=new html5Preloader();
  
  var i= // current map
    "bgterrain*:maps/"+map.name+"_terrain.png;"+
    "bgprops*:maps/"+map.name+"_props.png";
  
  var u= // team-neutral stuff
    'shells,missilered,exp1,exp2,exp2big,smoke,scaffold_,pillbox_'
  .split(',');
  
  for(var j=0; j<u.length; j++)
    i+=';'+u[j]+'*:gfx/'+u[j]+'.png';
  
  var u=( // stuff that has team-unique gfx
    'pistol,rocket,engineer,'+
    'apc,'+
    'comm,pillbox,barracks,turret,depot,repair,helipad'
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
  world.go();

};

////////////////////////////////////////////////////////////////////////////////

// BOOM! HEH.
window.onclick=function(e){
  var x=e.pageX;
  world.addPawn(
    new APC(x,world.getHeight(x),TEAM.GREEN)
  );
};

//window.ondblclick=function(e){  alert(e.pageX); };
