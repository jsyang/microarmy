// Base Entity /////////////////////////////////////////////////////////////////
function Pawn() {
  this.x;
  this.y;
  this.team;
  this.corpsetime;
  this.img={
    w:undefined, h:undefined,
    hDist2: undefined           // radius^2 for collision testing
  };
  this.alive=function(){};
  this.getGFX=function(){};
}

// Pick a random map: background + terrain /////////////////////////////////////
var map=(function() {
  var m='spring,afghan,egypt,chechnya'.split(',');
  var bases={
    blue:'526,26,123,26'.split(','),
    green:'1892,2394,2456,2410'.split(',')
  };
  var pick=$.R(0,m.length-1);
  m=m[pick];
  bases.blue=$.i(bases.blue[pick]);
  bases.green=$.i(bases.green[pick]);
  return {
    gfx:  ["maps/"+m+"_terrain.png","maps/"+m+"_props.png"],
    makeBases: function() {
      world.addPawn(
        new CommCenter(bases.blue,world.getHeight(bases.blue)+1,TEAM.BLUE)
      );
      world.addPawn(
        new CommCenter(bases.green,world.getHeight(bases.green)+1,TEAM.GREEN)
      );
    }    
  };    
})();


// Preload stuff ///////////////////////////////////////////////////////////////
var preloader=(function() {  
  // 1. Preload gfx
  return new html5Preloader(
    // current map
    "bgterrain*:"+map.gfx[0],
    "bgprops*:"+map.gfx[1],
    // special-fx
    'shells*:gfx/fire0.png',
    'exp1*:gfx/exp1.png',
    // infantry
    'pistolblue*:gfx/pistol0.png', 'rocketblue*:gfx/rocket0.png',
    'pistolgreen*:gfx/pistol1.png', 'rocketgreen*:gfx/rocket1.png',
    // structures
    'commblue*:gfx/commcenter0.png','commgreen*:gfx/commcenter1.png'
    // todo: vehicles, aircraft, 
    // Todo: Debris particles   
  );
})();

preloader.onfinish=function() {  
  // 2. Preload sfx/music
  soundManager.onready(function() {
    var list=(
      'pistol,rocket,die1,die2,die3,die4,'+
      'expsmall,accomp,crumble,mgburst'
    ).split(',');
    for(var i=list.length; i--;)
      soundManager.createSound(list[i],'./snd/'+list[i]);
    
    var list='decept,lof,march,otp,untamed'.split(',');
    for(var i=list.length; i--;)
      soundManager.createSound(list[i],'./mus/'+list[i]);
    
    // Very ugly, but will do for now; shuffle playlist.
    for(var i=[], j=0; j<list.length; i.push(j),j++);
    j=[]; do {
      var k=$.R(0,i.length-1);
      j=j.concat(i.splice(k,1));
    } while (i.length);
    //* Start the music
    soundManager.play(list[j[0]],{onfinish:function(){
      soundManager.play(list[j[1]],{onfinish:function(){
        soundManager.play(list[j[2]],{onfinish:function(){
          soundManager.play(list[j[3]],{onfinish:function(){     
            soundManager.play(list[j[4]]);
          }})
        }})
      }})
    }})
  });
  //*/
  
  // 3. Create the gameworld and run the game
  world=new World();
  world.go();
  // Experimental stuff: make comm centers and the comm centers build infantry
  map.makeBases();
};

// X-coord obj hash: avoid checking hits on faraway stuff //////////////////////
function XHash(worldWidth) {  
  // divide world into 1<<6 == 64 pixel buckets    
  var bucketWidth=6;
  var buckets=[];
  for(var i=(worldWidth>>bucketWidth)+1; i--;) buckets.push([]);
  
  this.getNBucketsByCoord=function(x,n) {
    for(var bucketsN=[],i=-(n>>1),index=x>>bucketWidth; i<(n>>1)+1; i++)
      if(buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(buckets[index+i]);
    return bucketsN;
  };

  this.insert=function(obj){ buckets[obj.x>>bucketWidth].push(obj); };
}

// Game world //////////////////////////////////////////////////////////////////
var world;

function World() {
  var w=2490, h=192;
  var heightmap=[];     // how high is the ground at this x.
  
  // instanceLists: gameworld's things
  var projectiles=[];
  var explosions=[];
  var infantry=[];  
  //var vehicles=[];
  //var aircraft=[];
  var structures=[];
  
  this.xHash=new XHash(w);
  
  // Draw map terrain, find heightmap.
  var BG=(function(w,h,heightmap) {
    var cv=document.createElement("canvas");
    cv.width=w; cv.height=h;
    document.body.appendChild(cv);
    var ctx=cv.getContext("2d");
    ctx.drawImage(preloader.getFile("bgterrain"),0,0);
    var data=ctx.getImageData(0,0,w,h).data;
    for(var x=0;x<w;x++) {
      for(var y=h-1; data[(y*w+x)*4+3];) y--;
      heightmap.push(y);
    }
    ctx.drawImage(preloader.getFile("bgprops"),0,0);
    ctx.drawImage(preloader.getFile("bgterrain"),0,0);
    return ctx;
  })(w,h,heightmap);
  
  // Drawing context for all the stuff that moves around
  var FG=(function(w,h) {
    var cv=document.createElement("canvas");
    cv.width=w; cv.height=h;
    document.body.appendChild(cv);
    return cv.getContext("2d");    
  })(w,h);  
  
  function processInstances(newXHash,vx,vw,instances) {
    // Process Pawns -- generic code
    for(var i=0, newInstances=[];i<instances.length;i++) {
      var a=instances[i];
      if(a.alive())           newXHash.insert(a);
      if(a.corpsetime>0)      newInstances.push(a);
      if(a.x>vx && a.x<vx+vw) {
        var gfx=a.getGFX();
        FG.drawImage(gfx.img,
          gfx.imgdx,  gfx.imgdy,  gfx.imgw,gfx.imgh,
          gfx.worldx, gfx.worldy, gfx.imgw,gfx.imgh
        );
      }
    }
    return newInstances;
  }
  
  function cycle() {
    // Run 1 cycle of the game loop.
    FG.clearRect(0,0,w,h);
    var viewWidth=window.innerWidth, viewLeft=document.body.scrollLeft;
    var xHash_=new XHash(w);
    
    structures=processInstances(xHash_,viewLeft,viewWidth,structures);
    infantry=processInstances(xHash_,viewLeft,viewWidth,infantry);
    projectiles=processInstances(xHash_,viewLeft,viewWidth,projectiles);
    explosions=processInstances(xHash_,viewLeft,viewWidth,explosions);    
    
    world.xHash=xHash_;
  };
  
  var timer;
  this.go=function() { timer=setInterval(cycle,40); };
  this.pause=function() { clearInterval(timer); };
  
  this.getHeight=function(x) { return (x>=0 && x<w) ? heightmap[x] : 0; };
  this.isOutside=function(obj) {
    return obj.x<0 || obj.x>=w || obj.y<0 || obj.y>heightmap[obj.x];
  };
  
  this.getCommCenterInfo=function(){
    for(var i=0; i<structures.length; i++) {
      var j=structures[i];
      if(j instanceof CommCenter)
        alert(
          TEAM.NAMES[j.team]+" base\n----------\n"+
          "reinforcements remaining:\n"+
          "PistolInfantry: "+j._.reinforce.supply[0]+"\n"+
          "RocketInfantry: "+j._.reinforce.supply[1]+"\n"
        );
    }
  };
  
  this.addPawn=function(obj) {
    if(obj instanceof Structure)  return structures.push(obj);
    if(obj instanceof Infantry)   return infantry.push(obj);
    if(obj instanceof Projectile) return projectiles.push(obj);
    if(obj instanceof Explosion)  return explosions.push(obj);
  };
};

/*
window.onclick=function(){
  var l=[$.R(60,180),$.R(460,580)];
  var t=[PistolInfantry,RocketInfantry][Math.round($.r(0.8))];
  world.addPawn(new t(l[0],world.getHeight(l[0]), TEAM.BLUE));
  world.addPawn(new t(l[1],world.getHeight(l[1]), TEAM.GREEN));
}
*/

// BOOM! HEH.
window.onclick=function(e){world.addPawn(new SmallExplosion(e.pageX,e.pageY));}

//window.ondblclick=function(e){ world.getCommCenterInfo(); };