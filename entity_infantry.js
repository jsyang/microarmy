INFANTRY={
  ACTION:{
    MOVEMENT:         0,
    ATTACK_STANDING:  1,
    ATTACK_CROUCHING: 2,
    ATTACK_PRONE:     3,
    DEATH1:           4,
    DEATH2:           5
  },
  SHOTFRAME:{ // in which frames do we want to spawn projectiles?
    PISTOL:[0,1,0,1,0,0,  0,1,0,1,0,0],
    ROCKET:[0,0,0,1,0,0,  0,0,0,1,0,0]
  }
};

Infantry = Pawn.extend({
  init:function(params){
    this._=$.extend({
      action:     INFANTRY.ACTION.MOVEMENT,
      frame:      { current:0, first:0, last: 5},
      target:     undefined,
      squad:      undefined,
      direction:  undefined,
      behavior:   { alive:Behavior.Library.Infantry, dead:Behavior.Library.InfantryDead },
      
      img:        { w:8, h:8, hDist2:20 },
      corpsetime: 180
    },params);
    this._super(this._);
    this._.direction=TEAM.GOALDIRECTION[this._.team];
  },
  setSpriteSheet:function(infantryType){
    this._.img.sheet=preloader.getFile(infantryType+TEAM.NAMES[this._team]);
  }
});

////////////////////////////////////////////////////////////////////////////////

PistolInfantry = Infantry.extend({
  init:function(params){
    this._=$.extend({
      projectile: Bullet,
      sight:      3,
      health:     { current:$.R(30,70) },
      reload:     { ing:0, time:40 },
      berserk:    { ing:0, time:$.R(10,26), chance:$.r(0.59) },
      ammo:       { clip:2, max:2 },
      meleeDmg:   8
    },params);
    this._super(this._);
    this.setSpriteSheet('pistol');
  }
});

RocketInfantry = Infantry.extend({
  init:function(params){
    this._=$.extend({
      projectile: SmallRocket,
      sight:      6,
      health:     { current:$.R(60,90) },
      reload:     { ing:0, time:$.R(90,120) },
      berserk:    { ing:0, time:$.R(6,21), chance:0.08+$.r(0.35) },
      ammo:       { clip:1, max:1 },
      meleeDmg:   23
    },params);
    this._super(this._);
    this.setSpriteSheet('rocket');
  }
});

EngineerInfantry = Infantry.extend({
  init:function(params){
    this._=$.extend({
      sight:      4,
      health:     { current:$.R(20,50) },
      build:      { type:undefined, x:undefined },
      meleeDmg:   5
    },params);
    this._super(this._);
    this._.behavior.alive=Behavior.Library.EngineerInfantry;
    this._.target=this._.build;
    this.setSpriteSheet('engineer');
  }
});