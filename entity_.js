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
  
  this.BUCKETWIDTH=1<<bucketWidth;
  
  // Can look in the direction in which it's pointing.
  this.getNearestEnemyRay=function(obj){ var _=obj._;
    var center=obj.x>>bucketWidth;
    var minDist=Infinity;    
    _.target=undefined;
    for(var d=0; d<_.sight; d++) {
      var shell=buckets[center+_.direction*d];
      if(!shell) continue;      
      for(var i=0; i<shell.length; i++) {
        var entity=shell[i];          
        if(entity.team==obj.team ||
           Behavior.Custom.isDead(entity) ||
           (entity.x-obj.x)*_.direction<0)
          continue;
        var dist=Math.abs(entity.x-obj.x);
        if(dist<minDist){
          _.target=entity; minDist=dist;
        }
      }
      if(_.target) break;
    }
  },
  
  this.getNearestEnemy=function(obj){
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
        if(entity.team==obj.team || Behavior.Custom.isDead(entity) ||
           Behavior.Custom.isCrewed(entity) ) continue;
        var dist=Math.abs(entity.x-obj.x);
        if(dist<minDist){
          obj._.target=entity; minDist=dist;
        }
      }
      if(obj._.target) break;
    }
  };
  
  // Get enemy crowd, pick a target that is near lots of other enemies
  // to maximize splash damage, priority on farthest first.
  this.getCrowdedEnemy=function(obj){ var _=obj._;
    var center=obj.x>>bucketWidth;
    var maxEnemies=0;
    _.target=undefined;    
    var DIRECTION={LEFT:-1,RIGHT:1,MAX:2};
    
    // search via direction rays
    for(var dir=DIRECTION.LEFT; dir<DIRECTION.MAX; dir+=2) {
      for(var sight=_.sight; sight; sight--) {
        if(buckets[center+dir*sight]) {
          var b=buckets[center+dir*sight];
          var bucketEnemies=0;
          for(var i=0; i<b.length; i++) {
            var entity=b[i];
            if(entity.team==obj.team || Behavior.Custom.isDead(entity))
              continue;
            bucketEnemies++;
            if(bucketEnemies>maxEnemies)
              _.target=entity;
          }          
          if(bucketEnemies>maxEnemies) {
            maxEnemies=bucketEnemies;
            console.log(maxEnemies);
          }
        }
      }
    }
  };
  
  // todo: optimize this code: usually we're looking for the closest
  // enemy / friendly to the current entity, so instead of getting the entire
  // range of buckets, we should go for layers, starting from the center...
  this.getNBucketsByCoord=function(x,n) {
    for(var bucketsN=[],i=-(n>>1),index=x>>bucketWidth; i<(n>>1)+1; i++)
      if(buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(buckets[index+i]);
    return bucketsN;
  };

  this.insert=function(obj){
    if(buckets[obj.x>>bucketWidth])
      buckets[obj.x>>bucketWidth].push(obj);
  };
}

// Win/loss event handler //////////////////////////////////////////////////////

var MISSION={
  EVENT:{
    DESTROYED:0,
    BUILT:1,
    CAPTURED:2,
    EXITEDMAPLEFT:3,
    EXITEDMAPRIGHT:4,
    REPAIRED:5,
    PANICKED:6,
    
    VAR_ISZERO:7    
  },
  RESULT:{
    NONE:0,
    WIN:1,
    LOSE:2,
    INCREMENT:3,
    DECREMENT:4
  }
};  

function Team(){
  var missionvars={
    status:MISSION.RESULT.NONE,
    unitsremaining:30
  };
  
  var won=false;
  var lost=false;
  
  var objective=[ // collection of event results (condition for win/loss/score)
    {trigger:MISSION.EVENT.DESTROYED, type:Infantry, missionvar:'unitsremaining', result: MISSION.RESULT.DECREMENT},
    {trigger:MISSION.EVENT.VAR_ISZERO, type:Infantry, missionvar:'unitsremaining', result: MISSION.RESULT.LOSE}
  ];
  
  var events=[];
  
  this.addEvent=function(e){ events.push(e); return events.length; };
  /*  ex: Event firing for a PistolInfantry death
          world.team[TEAM.NAMES[this.team]].addEvent(
            {type:PistolInfantry, event:MISSION.EVENT.DESTROYED}
          )
  */
  this.processEvents=function(){
    while(events.length){
      var e=events.shift();
      for(var j=0;j<objective.length; j++) {
        var o=objective[j];
        if(e.type instanceof o.type)
          if( (o.trigger==e.event) ||
              (o.trigger==MISSION.EVENT.VAR_ISZERO &&
               missionvars[o.missionvar]===0)
          ) {
            switch(o.result) {
              case MISSION.RESULT.DECREMENT:
                missionvars[o.missionvar]--; break;
              case MISSION.RESULT.INCREMENT:
                missionvars[o.missionvar]++; break;
              case MISSION.RESULT.WIN:
              case MISSION.RESULT.LOSE:
                missionvars['status']=o.result; break;
                // may want to return here if the team has won/lost
              default:
                alert("unexpected event result!"); break;
            }            
          }
      }
    }
  };
}

// Game world //////////////////////////////////////////////////////////////////
var world;

function World(map,team) {
  this.team=team; // todo: make this private.
  
  //if(!map) return alert("No map specified for world!");
  
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
      if(a.alive()) newXHash.insert(a);
      if(a.corpsetime>0) newInstances.push(a);
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
};