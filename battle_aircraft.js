var AIRCRAFT={
  STATE : {
    PITCHHIGH:    0,
    PITCHNORMAL:  1,
    PITCHLOW:     2,
    TURNING:      3
  },
  MANEUVER : {
    LANDING:    0,
    LOADING:    1, // REARMING
    DODGING:    2,
    PATROL:     3,
    STRAFE:     4,
    UNLOADING:  5
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
      projectile:   MGBullet,
      reload:       { ing:0, time: 70 },
      ammo:         { clip:12, max: 12 },
      shootHeight:  13,
      
      sight:        7,
      health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
      
      turn:         { ing: 0, current:0, last:4 },
      frame:        0,
      maxSpeed:     40,
      dspeed:       0.379,
      
      dx:           0.001,
      dy:           0.001,
      
      // todo: remove this
      //target:     undefined,
      rally:        window.lastMouse
      
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
    // todo: there's a bug here: involves turning at speed.
    if(_.turn.ing) return;
    
    if(_.dx == 0) {
      // ensure no divisions by 0
      _.dx = 0.01;
    }
    
    if(Math.abs(_.dy/_.dx)>3) {
      _.state = AIRCRAFT.STATE.PITCHNORMAL;
    } else {
      if(_.dx*_.dx+_.dy*_.dy>_.maxSpeed*0.3) {        
        if(_.dx*_.direction>0) {
          _.state = AIRCRAFT.STATE.PITCHLOW;
        } else {
          _.state = AIRCRAFT.STATE.PITCHHIGH;
        }
      } else {
        // Not going fast enough to pitch.
        _.state = AIRCRAFT.STATE.PITCHNORMAL;
      }
    }
  },
  
  attack:function() {
    if(Behavior.Custom.foundTarget.call(this)){
      Behavior.Custom.attack.call(this);
    }
  },
  
  alive:function(){ var _=this._;
    // chase the mouse.
    // turn if we have to.
    var distToRallyPoint = Math.abs(_.rally._.x-_.x);
    
    if(distToRallyPoint > 48) {
      // Don't turn to face things if they're close enough already
      Behavior.Custom.isFacingRally.call(this);      
    }
    
    if(_.y+(_.img.h>>1)-8>=world.height(_.x)){
      // Landed... (no crash code yet)

      _.dy = 0;
      _.dx = 0;
      
      _.turn.ing = 0;
      _.state = AIRCRAFT.STATE.PITCHNORMAL;
      
      _.dy+=_.rally._.y<_.y? -_.dspeed: 0;
      _.y = world.height(_.x)-(_.img.h>>1)+8+_.dy;
      _.x = Math.round(_.x);
      
    } else {

      // fly towards it.
      _.dx+=_.rally._.x<_.x? -_.dspeed: _.dspeed;
      _.dy+=_.rally._.y<_.y? -_.dspeed: _.dspeed;
    
      if(_.dx*_.dx+_.dy*_.dy>_.maxSpeed) {
        _.dy*=$.R(30,50)/100; // normalize speed with feedback
        _.dx*=$.R(70,80)/100;
      }
    
      // move around
      _.y+=_.dy;
      _.x+=_.dx;
      
      // Don't stutter past the ground.
      if(_.y+(_.img.h>>1)-8>=world.height(_.x)){
        _.y = world.height(_.x)-(_.img.h>>1)+8;
      }
      
      this.getAngle();
    }    
    
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