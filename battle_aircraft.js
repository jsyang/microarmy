var AIRCRAFT={
  STATE : {
    GOOD          : 0,
    WRECK         : 1,
    TURNING_YAW   : 2,
    TURNING_ROLL  : 3
  },
  MANEUVER : {
    LANDING : 0,
    LOADING : 1, // REARMING
    DODGING : 2,
    PATROL  : 3
  },
  ALTITUDE : {
    HIGH    : 0,
    MEDIUM  : 1,
    LOW     : 2
  }
};

Aircraft = Pawn.extend({
  init:function(params){
    this._=$.extend({
      corpsetime: 800,
      state:      AIRCRAFT.STATE.GOOD,
      behavior:   { alive:Behavior.Library.Aircraft, dead:Behavior.Library.AircraftDead },
      target:     undefined,
      squad:      undefined,
      direction:  undefined
    },params);
    this.setDirection();
    this.setSpriteSheet(this._.img.sheet); // sheet is a string before here.
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx: 0,//imgdx:  _.direction>0? _.img.w : 0,
      imgdy: 0,//imgdy:  _.state*_.img.h,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:_.img.w,
      imgh:_.img.h
    }
  },
  setSpriteSheet:function(structureType){
    this._.img.sheet=preloader.getFile(structureType+TEAM.NAMES[this._.team]);
  },
  setDirection:function(){
    this._.direction=TEAM.GOALDIRECTION[this._.team];
  },
  alive:function(){ var _=this._;
    if(Behavior.Custom.isDead.call(this)) {
      Behavior.Execute(_.behavior.dead,this);
      return false;
    } else {
      Behavior.Execute(_.behavior.alive,this);      
      return true;
    }
  }
});

////////////////////////////////////////////////////////////////////////////////

AttackHelicopter = Aircraft.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:28, h:28, hDist2:196, sheet:'comm' },
      behavior:     { alive: Behavior.Library.AttackHelicopter, dead:Behavior.Library.AircraftDead },
      
      maxAltitude:  AIRCRAFT.ALTITUDE.MEDIUM,
      
      projectile:   MediumRocketHE,
      sight:        7,
      health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
      reload:       { ing:0, time:$.R(90,120) },
      ammo:         { clip:3, max:12 },
      
      rallyPoint:   undefined
      
    },params);
    this._super(this._);
    this.setRallyPoint();
  },
  setRallyPoint:function(){ var _=this._;
  // todo
    var commander   = world._.pawns.commander[_.team]._;
    if(commander.attention) {
      _.rallyPoint = commander.attention;
    } else {
      _.rallyPoint = $.R(0,world._.w);
    }
  }
});