var TEAM={
  NONE:-1,  
  BLUE: 0,
  GREEN:1,
  
  MAX:2,
  
  GOALDIRECTION:[1,-1],
  NAMES:'blue,green'.split(',')
};

// Base Entity /////////////////////////////////////////////////////////////////
function Pawn() {
  this.x;
  this.y;
  this.team;
  this.corpsetime;
  this.img={
    w:undefined, h:undefined,
    hDist2: undefined,        // hit radius^2 for collision testing
    sheet: undefined          // sprite sheet
  };
  this.alive=function(){};    // cycling-function while active
  this.getGFX=function(){};
}

// X-coord spatial hash: avoid checking hits on faraway stuff //////////////////
function XHash(worldWidth) {    
  var bucketWidth=6; // divide world into 1<<6 == 64 pixel buckets
  var buckets=[];
  for(var i=(worldWidth>>bucketWidth)+1; i--;) buckets.push([]);
  
  this.getNearEnemy=function(obj){
    var sight=obj._.sight;
    var center=obj.x>>bucketWidth;
    var minDist=Infinity;    
    obj._.target=undefined;    
    // buckets left,right of the center.
    for(var left=right=center; sight; left--,right++, sight--) {
      var shell=[];
      if(buckets[left])                 shell=shell.concat(buckets[left]);
      if(left!=right && buckets[right]) shell=shell.concat(buckets[right]);
      
      for(var i=0; i<shell.length; i++) {
        var entity=shell[i];          
        if(entity.team==obj.team || entity._.health<=0) continue;
        var dist=Math.abs(entity.x-obj.x);
        if(!(dist>>sight) && dist<minDist){
          obj._.target=entity; minDist=dist;
        }
      }
      if(obj._.target) break;
    }
  };
  
  // todo: get farthest enemy
  this.getFarEnemy=function(obj){};

  // todo: get enemy crowd, pick a target that is near lots of other enemies
  // to maximize splash damage
  this.getCrowdedEnemy=function(obj){};
  
  // todo: optimize this code: usually we're looking for the closest
  // enemy / friendly to the current entity, so instead of getting the entire
  // range of buckets, we should go for layers, starting from the center...
  this.getNBucketsByCoord=function(x,n) {
    for(var bucketsN=[],i=-(n>>1),index=x>>bucketWidth; i<(n>>1)+1; i++)
      if(buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(buckets[index+i]);
    return bucketsN;
  };

  this.insert=function(obj){ buckets[obj.x>>bucketWidth].push(obj); };
}

// Win/loss event handler //////////////////////////////////////////////////////

var ObjectivesLibrary={
  ExitedMapLeftEdge:  function(caller){return caller.x<0;},
  ExitedMapRightEdge: function(caller){return caller.x>=world.width;},
  
  AllUnitsLost:       function(caller){return caller.units.length<=0;},
  UnitDestroyed:      function(caller){return caller._.health<=0;}
  // add a timer objective as well.
};



var MISSION={
  EVENT:{
    DESTROYED:0,
    BUILT:1,
    CAPTURED:2,
    EXITEDMAP:3,
    REPAIRED:4,
    PANICKED:5,
    
    VALUE
  },
  RESULT:{
    NONE:0,
    WIN:1,
    LOSE:2,
    INCREMENT:3,
    DECREMENT:4
  }
};  

/*
  Scaffold completes and builds a commcenter
  -> send message to world
     (inserted as an extra step in the low-level behavior
     or as a behavior itself)
    -> scaffold's team, CommCenter, MISSION.EVENT.BUILT

  world.cycle()
  -> processInstances() (this is where the message is generated)
  -> processMissionEvents()
    -> produces results of the mission events

*/

function Team(team){
  this.units=[];
  this.team=team;
  this.missionvars={
    unitsremaining:30
  };
  this.mission=[ // collection of event results (condition for win/loss/score)
    {trigger:MISSION.EVENT.DESTROYED, type:Infantry, result: MISSION.RESULT.DECREMENT, value:'unitsremaining'},
    {trigger:MISSION.EVENT.DESTROYED, type:Infantry, result: MISSION.RESULT.CREMENT, value:30},
  ];  
}

// Game world //////////////////////////////////////////////////////////////////
var world;

function World(map) {
  if(!map) return alert("No map specified for world!");
  
  var w=2490, h=192;
  this.width=w; this.height=h;
  
  // Pawn collections
  var projectiles=[];
  var explosions=[];
  var infantry=[];  
  var vehicles=[];
  //var aircraft=[];
  var structures=[];
  
  this.xHash=new XHash(w);
  
  var canvasElement=document.createElement("canvas");
  canvasElement.width=w; canvasElement.height=w;  
  var FG=canvasElement.getContext('2d');
  
  // to avoid having 2 canvases, use a single one to
  // generate the background and then clear it for FG
  var imgElement=document.createElement("img");
  imgElement.className="BG";
  
  FG.putImageData(Generate.BG(FG,w,h),0,0);
  var terrain=Generate.FG(FG,w,h);
  FG.putImageData(terrain.imgdata_,0,0);  
  imgElement.src=canvasElement.toDataURL("image/png");
  document.body.appendChild(imgElement);
  document.body.appendChild(canvasElement);    
  FG.clearRect(0,0,w,h);

  var heightmap=terrain.heightmap_;

  // Process active Pawns
  function processInstances(newXHash,vx,vw,instances) {    
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
  
  // Run 1 cycle of the game loop.
  function cycle() {
    FG.clearRect(0,0,w,h);
    var viewWidth=window.innerWidth, viewLeft=document.body.scrollLeft;
    var xHash_=new XHash(w);
    
    structures= processInstances(xHash_,viewLeft,viewWidth,structures);
    vehicles=   processInstances(xHash_,viewLeft,viewWidth,vehicles);
    infantry=   processInstances(xHash_,viewLeft,viewWidth,infantry);
    projectiles=processInstances(xHash_,viewLeft,viewWidth,projectiles);
    explosions= processInstances(xHash_,viewLeft,viewWidth,explosions);    
    
    world.xHash=xHash_;    
  }
  
  var timer;
  this.go=function()    { timer=setInterval(cycle,40); };
  this.pause=function() { clearInterval(timer); };
  
  this.getHeight=function(x) { return (x>=0 && x<w) ? heightmap[x>>0] : 0; };
  
  this.isOutside=function(obj) {
    var x=obj.x>>0, y=obj.y>>0;
    return x<0 || x>=w || y>heightmap[x]; // || y<0
  };
    
  this.addPawn=function(obj) {
    if(obj instanceof Vehicle)    return vehicles.push(obj);
    if(obj instanceof Structure)  return structures.push(obj);
    if(obj instanceof Infantry)   return infantry.push(obj);
    if(obj instanceof Projectile) return projectiles.push(obj);
    if(obj instanceof Explosion)  return explosions.push(obj);
    return false;
  };
  
  // todo: Add map's entities, predefined only during runtime  
};