var STRUCTURE={
  STATE:{
    GOOD:0,
    BAD:1,
    WRECK:2
  }
};

Structure = Pawn.extend({
  init:function(params){
    this._=$.extend({
      corpsetime: Infinity,
      state:      STRUCTURE.STATE.GOOD,
      behavior:   { alive:Behavior.Library.Structure, dead:Behavior.Library.StructureDeadExplode }
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

CommCenter = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:28, h:28, hDist2:196, sheet:'comm' },
      health:       { current:$.R(2100,2500), max:$.R(2500,2600) },      
      reinforce:    { ing: 0, time: 10,
                      types:  {
                        PistolInfantry:   {qty:320, make:PistolInfantry},
                        RocketInfantry:   {qty:180, make:RocketInfantry},
                        EngineerInfantry: {qty:20,  make:EngineerInfantry}
                      },
                      
                      supplyType:   undefined,
                      supplyNumber: 0,
                      rallyPoint:   undefined,
                      engineerBuild:undefined,
                      parentSquad:  undefined, // squad unit belongs to when it's created
                      
                      // big dmg kills reinforcements
                      damageThreshold:  18,
                      damageChance:     0.4
                    }
    },params);
    this._super(this._);
  }
});

Barracks = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:32, h:12, hDist2:169, sheet:'barracks' },
      health:       { current:$.R(1800,1950), max:$.R(1950,2500) },
      reinforce:    { ing: 0, time: 10,
                      types: {
                        PistolInfantry:   {qty:250,make:PistolInfantry},
                        EngineerInfantry: {qty:2,make:EngineerInfantry}
                      },
                      
                      supplyType:   undefined,
                      supplyNumber: 0,
                      rallyPoint:   undefined,
                      engineerBuild:undefined,
                      parentSquad:  undefined, // squad unit belongs to when it's created
                      
                      // big dmg kills reinforcements
                      damageThreshold:  24,
                      damageChance:     0.6
                    }
    },params);
    this._super(this._);
  }
});

Scaffold = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:16, h:8, hDist2:64, sheet:'scaffold_' },
      behavior:     { alive:Behavior.Library.Scaffold, dead:Behavior.Library.StructureDead },
      health:       { current:$.R(360,400), max:$.R(400,450) },
      build:        { type:undefined },
      crew:         { current: 1, max:2,
                      occupied: function(o){
                        return preloader.getFile('scaffold'+TEAM.NAMES[o._.team]);
                      },
                      empty: preloader.getFile('scaffold_'),
                      
                      damageThreshold:  5,
                      damageChance:     1
                    }
    },params);
    this._super(this._);
    soundManager.play('tack');
  },
  // How many workers do we need to construct this?
  setBuildCrewCount:function(){ var _=this._;
    var t=_.build.type;
    var crewCount=8;
    if(t instanceof Pillbox)            crewCount=4;
    else if(t instanceof MissileRack)   crewCount=8;
    else if(t instanceof SmallTurret)   crewCount=6;
    else if(t instanceof Barracks)      crewCount=16;
    else if(t instanceof CommCenter)    crewCount=60;
    _.crew.current=1;
    _.crew.max=crewCount;
  }
});

CommRelay = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:15, h:27, hDist2:220, sheet:'relay' },
      health:       { current:$.R(560,600), max:$.R(600,750) }
    },params);
    this._super(this._);
    soundManager.play('tack');
  }
});

// todo
Depot = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:19, h:8, hDist2:64, sheet:'depot' },
      target:       undefined
    },params);
    this._super(this._);
  }
});

// todo
RepairYard = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:19, h:8, hDist2:64, sheet:'repair' },
      target:       undefined
    },params);
    this._super(this._);
  }
});

// todo
Helipad = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:19, h:8, hDist2:64, sheet:'helipad' },
      target:       undefined
    },params);
    this._super(this._);
  }
});

// Defensive structures
Pillbox = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:19, h:8, hDist2:64, sheet:'pillbox_' },
      behavior:     { alive:Behavior.Library.Pillbox, dead: Behavior.Library.StructureDeadExplode },
      sight:        3,
      health:       { current:$.R(800,900), max:$.R(800,1100) },
      projectile:   MGBullet,
      reload:       { ing:0, time: 50 },
      ammo:         { clip:6, max: 6 },
      shootHeight:  5,
      crew:         { current: 0, max:4,
                      occupied: function(o){
                        return preloader.getFile('pillbox'+TEAM.NAMES[o._.team]);
                      },
                      empty: preloader.getFile('pillbox_'),
                      damageThreshold:  23,
                      damageChance:     0.25
                    }
    },params);
    this._super(this._);
  }
});

SmallTurret = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:22, h:9, hDist2:90, sheet:'turret' },
      behavior:     { alive:Behavior.Library.SmallTurret, dead: Behavior.Library.StructureDeadExplode },
      sight:            5,
      health:           { current:$.R(1900,2100), max:$.R(2100,2300) },
      projectile:       SmallShell,
      projectileSpeed:  7,
      reload:           { ing:0, time: 90 },
      ammo:             { clip:1, max: 1 },
      shootHeight:      6,
      turn:             { ing: 0, current:0, last:4 }
    },params);
    this._super(this._);
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  (_.direction>0)? _.img.w:0,
      imgdy:
        _.state!=STRUCTURE.STATE.WRECK?
          _.state*45+_.img.h*_.turn.current
          :90,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:_.img.w,
      imgh:_.img.h
    };
  }
});

MissileRack = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:5, h:9, hDist2:64, sheet:'missilerack' },
      behavior:     { alive:Behavior.Library.MissileRack, dead: Behavior.Library.StructureDeadExplode },
      sight:        13,
      health:       { current:$.R(200,280), max:$.R(280,300) },
      projectile:   HomingMissile,
      reload:       { ing:0, time: 5600 },
      ammo:         { clip:1, max: 1, supply: 3 },
      shootHeight:  3
    },params);
    this._super(this._);
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  _.direction>0? _.img.w:0,
      imgdy:  _.health<=0 || !_.ammo.clip || (_.ammo.clip && _.reload.ing>50)? _.img.h:0,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:_.img.w,
      imgh:_.img.h
    };
  }
});