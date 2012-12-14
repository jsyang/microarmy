var AIRCRAFT={
  STATE : {
    PITCHHIGH:    0,
    PITCHNORMAL:  1,
    PITCHLOW:     2,
    TURNING:      3
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
    this._.img.sheet=preloader.getFile(structureType+this._.team);
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
// make this thing follow the mouse first..
// this is a mess.

AttackHelicopter = Aircraft.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:42, h:26, hDist2:625, sheet:'heli' },
      behavior:     { alive: Behavior.Library.AttackHelicopter, dead:Behavior.Library.AircraftDead },
      
      maxAltitude:  AIRCRAFT.ALTITUDE.MEDIUM,
      
      state:        AIRCRAFT.STATE.PITCHNORMAL,
      projectile:   MediumRocketHE,
      sight:        7,
      health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
      reload:       { ing:0, time:$.R(90,120) },
      ammo:         { clip:3, max:12 },
      turn:         { ing: 0, current:0, last:4 },
      frame:        0,
      maxspeed:     2,
      dspeed:       0.379,
      
      dx:           0.001,
      dy:           0.001,
      
      // todo: remove this
      target:       window.lastMouse,
      rallyPoint:   undefined
      
    },params);
    this._super(this._);
    //this.setRallyPoint();
  },
  gfx:function(){ var _=this._;
    if(_.turn.ing){
      _.frame = _.turn.current;
    } else {
      // Rotor spin.
      _.frame++;
      _.frame%=2;
    }
    
    return {
      img:    _.img.sheet,
      imgdx:  _.img.w*_.frame,
      imgdy:  _.direction>0? _.img.h*(_.state+4) : _.img.h*_.state,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-(_.img.h>>1),
      imgw:   _.img.w,
      imgh:   _.img.h
    }
  },
  
  getAngle:function(){ var _=this._;
    if(_.turn.ing) return;
    
    if(Math.abs(_.dy/_.dx)>3) {
      _.state = AIRCRAFT.STATE.PITCHNORMAL;
    } else {
      if(_.dx*_.direction>0) {
        _.state = AIRCRAFT.STATE.PITCHLOW;
      } else {
        _.state = AIRCRAFT.STATE.PITCHHIGH;
      }
    }
  },
  
  alive:function(){ var _=this._;
    // chase the mouse.
    // turn if we have to.
    Behavior.Custom.isFacingTarget.call(this);
    
    // fly towards it.
    // todo: this works for missiles but not for aircraft.. too wild!
    _.dx+=_.target._.x<_.x? -_.dspeed: _.dspeed;
    _.dy+=_.target._.y<_.y? -_.dspeed: _.dspeed;
    
    if(_.dx*_.dx+_.dy*_.dy>_.maxSpeed) {
      _.dy/=$.R(100,300); // normalize speed with feedback
      _.dx/=$.R(100,300);
    }
    
    _.y+=_.dy;
    _.x+=_.dx;  
    
    this.getAngle();
    
    return true;
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