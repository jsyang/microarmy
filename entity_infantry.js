var INFANTRY={
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

////////////////////////////////////////////////////////////////////////////////

Infantry.prototype=new Pawn;
function Infantry() {
  this.img={ w:8, h:8, hDist2:20 };
  this.corpsetime=180;
  this.takeDamage=function(d){ return this._.health.current-=d; };
  this.getGFX=function(){ var _=this._; return {
      img:    _.imgSheet,
      imgdx:  _.frame.current*this.img.w,
      imgdy:  _.action*this.img.w,
      worldx: this.x-(this.img.w>>1), worldy: this.y-this.img.h+1,
      imgw: this.img.w,               imgh: this.img.h
  }; };
  
  this.alive=function(){ var _=this._;
    if(Behavior.Custom.isDead(this)) {
      if(!this.corpsetime) return false;
      if(_.action<INFANTRY.ACTION.DEATH1) {
        _.action=$.R(INFANTRY.ACTION.DEATH1,INFANTRY.ACTION.DEATH2);
        _.frame.current=_.frame.first;
        soundManager.play('die1,die2,die3,die4'.split(',')[$.R(0,3)]);
      } else {
        if(_.frame.current<_.frame.last) _.frame.current++;
        else this.corpsetime--;
      }
      return false;
    } else {
      Behavior.Execute(_.behavior,this);
      return true;      
    }
  };
  
}

////////////////////////////////////////////////////////////////////////////////
// Sight in XHash buckets = sight*(1<<6) pixels
////////////////////////////////////////////////////////////////////////////////

PistolInfantry.prototype=new Infantry;
function PistolInfantry(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this._={
    action:     INFANTRY.ACTION.MOVEMENT,
    frame:      { current:0, first:0, last:5 },
    target:     undefined,
    direction:  TEAM.GOALDIRECTION[team],
    behavior:   Behavior.Library.Infantry,
    
    imgSheet:   preloader.getFile('pistol'+TEAM.NAMES[team]),
    projectile: Bullet,
    sight:      8,
    health:     {current:$.R(30,70)},
    reload:     { ing:0, time:40 },
    berserk:    { ing:0, time:$.R(10,26), chance:$.r(0.59) },
    ammo:       { clip:2, max:2 },
    meleeDmg:   8
  };
}

RocketInfantry.prototype=new Infantry;
function RocketInfantry(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this._={
    action:     INFANTRY.ACTION.MOVEMENT,
    frame:      { current:0, first:0, last:5 },
    target:     undefined,
    direction:  TEAM.GOALDIRECTION[team],
    behavior:   Behavior.Library.Infantry,
    
    imgSheet:   preloader.getFile('rocket'+TEAM.NAMES[team]),
    projectile: SmallRocket,
    sight:      12,
    health:     {current:$.R(60,90)},
    reload:     { ing:0, time:$.R(90,120) },
    berserk:    { ing:0, time:$.R(6,21), chance:0.08+$.r(0.35) },
    ammo:       { clip:1, max:1 },
    meleeDmg:   23
  };
}

EngineerInfantry.prototype=new Infantry;
function EngineerInfantry(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this._={
    action:     INFANTRY.ACTION.MOVEMENT,
    frame:      { current:0, first:0, last:5 },
    target:     undefined,
    build:      { type:undefined, x:undefined },
    direction:  TEAM.GOALDIRECTION[team],
    behavior:   Behavior.Library.EngineerInfantry,
    
    imgSheet:   preloader.getFile('engineer'+TEAM.NAMES[team]),
    health:     {current:$.R(20,50)},
    meleeDmg:   5
  };
  
  // Set the target here or set it when the Engineer infantry is deployed.
  this._.target=this._.build;
}