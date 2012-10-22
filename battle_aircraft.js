var AIRCRAFT={
  STATE : {
    GOOD          : 0,
    POOR          : 1,
    WRECK         : 2,
    TURNING_YAW   : 3,
    TURNING_ROLL  : 4
  }
};

Aircraft = Pawn.extend({
  init:function(params){
    this._=$.extend({
      corpsetime: 400,
      state:      AIRCRAFT.STATE.GOOD,
      behavior:   { alive:Behavior.Library.Aircraft, dead:Behavior.Library.AircraftDead }
    },params);
    this.setDirection();
    this.setSpriteSheet(this._.img.sheet); // sheet is a string before here.
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  _.direction>0? _.img.w : 0,
      imgdy:  _.state*_.img.h,
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
      // shouldn't be able to target an unoccupied building
      if(_.crew && !_.crew.current) {
        _.img.sheet=_.crew.empty;
        return false;
      }
      return true;
    }
  }
});

////////////////////////////////////////////////////////////////////////////////

TransportHelicopter = Aircraft.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:28, h:28, hDist2:196, sheet:'comm' },
      health:       { current:$.R(2100,2500), max:$.R(2500,2600) }
    },params);
    this._super(this._);
  }
});