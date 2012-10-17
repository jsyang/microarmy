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
                        PistolInfantry:   {qty:400, make:PistolInfantry},
                        RocketInfantry:   {qty:600, make:RocketInfantry},
                        EngineerInfantry: {qty:40,  make:EngineerInfantry}
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
                        PistolInfantry:   {qty:275, make:PistolInfantry},
                        EngineerInfantry: {qty:10,   make:EngineerInfantry}
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
    
    // todo hardcoded
    if(world._.pawns.commander[this._.team])
      world._.pawns.commander[this._.team]._.depot.unshift(this);
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
    if(t instanceof Pillbox)              crewCount=4;
    else if(t instanceof MissileRack)     crewCount=8;
    else if(t instanceof MissileRackSmall)crewCount=1;
    else if(t instanceof SmallTurret)     crewCount=6;
    else if(t instanceof Barracks)        crewCount=16;
    else if(t instanceof CommCenter)      crewCount=60;
    else if(t instanceof MineFieldSmall)  crewCount=1;
    else if(t instanceof AmmoDumpSmall)   crewCount=1;
    else if(t instanceof AmmoDump)        crewCount=2;
    _.crew.current=1;
    _.crew.max=crewCount;
  }
});

CommRelay = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:15, h:27, hDist2:220, sheet:'relay' },
      health:       { current:$.R(560,600), max:$.R(600,750) },
      // todo guide missile racks / other comm
      //behavior:     { alive:Behavior.Library.CommRelay, dead: Behavior.Library.StructureDeadExplode },
    },params);
    this._super(this._);
    soundManager.play('tack');
  }
});

WatchTower = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:13, h:21, hDist2:196, sheet:'watchtower' },
      health:       { current:$.R(300,350), max:$.R(360,400) },
      //behavior:     { alive:Behavior.Library.WatchTower, dead: Behavior.Library.StructureDead },
      sight:        13
    },params);
    this._super(this._);
  }
});

AmmoDump = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:18, h:9, hDist2:100, sheet:'ammodump' },
      health:       { current:$.R(80,120), max:$.R(130,150) },
      behavior:     { alive:Behavior.Library.AmmoDump, dead: Behavior.Library.StructureDeadExplode },
      reload:       { ing: 0, time: 500 },
      supply:       { types: {
                      HomingMissile:      { qty:$.R(10,20), make: HomingMissile },
                      HomingMissileSmall: { qty:$.R(60,80), make: HomingMissileSmall }
                    }},
      totalSupply:  0,
      sight:        6
    },params);
    this._super(this._);
    this.calculateSupply();
  },
  calculateSupply:function(){ var _=this._;
    for(var i in _.supply.types)
      _.totalSupply+=_.supply.types[i].qty;
  }
});

AmmoDumpSmall = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:4, h:6, hDist2:25, sheet:'ammodumpsmall' },
      health:       { current:$.R(80,120), max:$.R(130,150) },
      behavior:     { alive:Behavior.Library.AmmoDump, dead: Behavior.Library.StructureDeadExplode },
      reload:       { ing: 0, time: 300 },
      supply:       { types: {
                      HomingMissileSmall: { qty:$.R(30,40), make: HomingMissileSmall }
                    }},
      totalSupply:  0,
      sight:        5
    },params);
    this._super(this._);
    this.calculateSupply();
  },
  calculateSupply:function(){ var _=this._;
    for(var i in _.supply.types)
      _.totalSupply+=_.supply.types[i].qty;
  }
});

MineFieldSmall = Structure.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:200, h: 1 },
      corpsetime:   0
    },params);
  },
  alive:function(){ var _=this._;
    var mineX = _.x + $.R(0,128) - $.R(0,128);
    for(var numMines = $.R(2,4); numMines-->0;) {
      mineX += 7;
      world.add(new SmallMine({
        x:    mineX,
        y:    world.height(mineX),
        team: _.team
      }));
    }
    return false;
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
      corpsetime:   1,
      projectile:   HomingMissile,
      reload:       { ing:240, time: 2900 },
      ammo:         { clip:1, max: 1, supply: 3, maxsupply: 3 },
      shootHeight:  3
    },params);
    this._super(this._);
  },
  gfx:function(){ var _=this._;
  
    var frame = _.img.h;
    if(_.health.current>0) {
      if(_.ammo.supply>0) {
        if(_.ammo.clip) {
          frame = 0;
        } else if(!_.ammo.clip && _.reload.ing<40) {
          frame = 0;
        }
      }
    } else {
      frame = _.img.h*2;
    }
    
    return {
      img:    _.img.sheet,
      imgdx:  _.direction>0? _.img.w:0,
      imgdy:  frame,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:_.img.w,
      imgh:_.img.h
    };
  }
});

MissileRackSmall = MissileRack.extend({
  init:function(params){
    this._=$.extend({
      img:          { w:4, h:7, hDist2:18, sheet:'missileracksmall' },
      behavior:     { alive:Behavior.Library.MissileRack, dead: Behavior.Library.StructureDeadExplode },
      sight:        9,
      health:       { current:$.R(100,180), max:$.R(180,200) },
      corpsetime:   1,
      projectile:   HomingMissileSmall,
      reload:       { ing:60, time: 190 },
      ammo:         { clip:1, max: 1, supply: 12, maxsupply: 12 },
      shootHeight:  2
    },params);
    this._super(this._);
  }
});