var TEAM={
  NONE:-1,
  BLUE: 0,
  GREEN:1,

  MAX:2,

  GOALDIRECTION:[1,-1],
  NAMES:'blue,green'.split(',')
};

// Your basic abstract gamepiece.
Pawn = Class.extend({
  init:function(params){
    this._=$.extend({
      x:undefined,
      y:undefined,
      team: undefined,
      corpsetime:undefined,
      img: {
        w:undefined,
        h:undefined,
        hDist2:undefined,     // hit radius^2 for collision testing
        sheet:undefined       // sprite sheet
      },
      behavior: {
        alive: undefined,
        dead: undefined
      }
    },params);
  },

  // Should the world keep track of this instance?
  alive:function(){ var _=this._;
    if(Behavior.Custom.isDead(this)) {
      Behavior.Execute(_.behavior.dead,this);
      return false;
    } else {
      Behavior.Execute(_.behavior.alive,this);
      return true;
    }
  },

  gfx:function(){
    // taken from infantry class.
    var _=this._; return {
      img:    _.img.sheet,
      imgdx:  _.frame.current*_.img.w,
      imgdy:  _.action*_.img.w,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw: _.img.w,
      imgh: _.img.h
    };
  }
});

// todo.
// X-coord spatial hash: avoid checking hits on faraway stuff //////////////////

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

// Battleview game world (scene graph) ////////////////////////////////////////////////////
var world;

function World() {
  var w=2490, h=256;
  this.width=w; this.height=h;

  var controllers=[];

  // Pawn collections
  var projectiles=[];
  var explosions=[];
  var infantry=[];
  var vehicles=[];
  var aircraft=[];
  var structures=[];

  this.xHash=new XHash(w);

  var canvasElement=document.createElement("canvas");
  canvasElement.width=w; canvasElement.height=h;
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

  // reset the structure heights
  for(var i=0; i<terrain.structs_.length; i++) {
    terrain.structs_[i].y=heightmap[terrain.structs_[i].x];
    structures.push(terrain.structs_[i]);
  }
  // add the controllers.
  controllers=terrain.control_.slice(0);

  // Commanders / Squads -- higher level AI
  function processControllers(controllers) {
    for(var i=0, newControllers=[]; i<controllers.length; i++)
      if(controllers[i].alive())
        newControllers.push(controllers[i]);
    return newControllers;
  }

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

    controllers=processControllers(controllers);

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

  this.addController=function(obj) {
    if(obj instanceof PawnController) return controllers.push(obj);
    return false;
  };
};