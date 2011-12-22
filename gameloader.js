// Pick a random map: background + terrain + entities //////////////////////////

var map=(function() {
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
        { obj: Pillbox, team: TEAM.GREEN, x: 2148 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1945 },
        { obj: Pillbox, team: TEAM.GREEN, x: 1352 },
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
})();

// Preload stuff ///////////////////////////////////////////////////////////////

var preloader=(function() {
  
  document.title+=" -- "+map.name;
  
  // 1. Preload gfx
  return new html5Preloader(
    // current map
    "bgterrain*:maps/"+map.name+"_terrain.png",
    "bgprops*:maps/"+map.name+"_props.png",
    // special-fx
    'shells*:gfx/fire0.png',
    'exp1*:gfx/exp1.png','exp2*:gfx/exp2.png',
    // infantry
    'pistolblue*:gfx/pistol0.png', 'rocketblue*:gfx/rocket0.png',
    'pistolgreen*:gfx/pistol1.png', 'rocketgreen*:gfx/rocket1.png',
    // structures
    'commblue*:gfx/commcenter0.png','commgreen*:gfx/commcenter1.png',
    'pillboxblue*:gfx/pillbox0.png','pillboxgreen*:gfx/pillbox1.png',
    'pillbox_*:gfx/pillbox_.png',
    
    'barracksblue*:gfx/barracks0.png','barracksgreen*:gfx/barracks1.png'
    // todo: vehicles, aircraft, 
    // Todo: Debris particles   
  );
})();

preloader.onfinish=function() {  
  // 2. Preload sfx/music
  soundManager.onready(function() {
    var list=(
      'pistol,mgburst,rocket,die1,die2,die3,die4,'+
      'expsmall,expfrag,accomp,crumble,sliderack1,'+
      'tack'
    ).split(',');
    for(var i=list.length; i--;)
      soundManager.createSound(list[i],'./snd/'+list[i]);
    
    // [MUSIC CODE HERE] -- removed for now..    
  });
    
  // 3. Create the gameworld.
  world=new World();
  
  // 4. Add map's entities.
  for(var i=map.entities.length; i-->0;) {
    var j=map.entities[i]; if(j)
      world.addPawn( new (j.obj)(j.x,world.getHeight(j.x),j.team) );
  }
  
  // 5. START!
  world.go();
  
};

////////////////////////////////////////////////////////////////////////////////

/* [MUSIC CODE] Start the music
    var list='decept,lof,march,otp,untamed'.split(',');
    for(var i=list.length; i--;)
      soundManager.createSound(list[i],'./mus/'+list[i]);
    
    // Very ugly, but will do for now; shuffle playlist.
    for(var i=[], j=0; j<list.length; i.push(j),j++);
    j=[]; do {
      var k=$.R(0,i.length-1);
      j=j.concat(i.splice(k,1));
    } while (i.length);
    
    soundManager.play(list[j[0]],{volume:70, onfinish:function(){
      soundManager.play(list[j[1]],{volume:70, onfinish:function(){
        soundManager.play(list[j[2]],{volume:70, onfinish:function(){
          soundManager.play(list[j[3]],{volume:70, onfinish:function(){     
            soundManager.play(list[j[4]],{volume:70} );
          }})
        }})
      }})
    }})
    //*/