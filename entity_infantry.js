var TEAM={  
  BLUE: 0,
  GREEN:1,  
  GOALDIRECTION:[1,-1],
  NAMES:'blue,green'.split(',')
};

var INFANTRY={
  ACTION:{
    MOVEMENT:         0,
    ATTACK_STANDING:  1,
    ATTACK_CROUCHING: 2,
    ATTACK_PRONE:     3,
    DEATH1:           4,
    DEATH2:           5
  },
  SHOTFRAME:{
    PISTOL:[0,1,0,1,0,0,  0,1,0,1,0,0],
    ROCKET:[0,0,0,1,0,0,  0,0,0,1,0,0]
  }
};

Infantry.prototype=new Pawn;
function Infantry() {
  this.img={ w:8, h:8, hDist2:20 };
  
  this.correctDirection=function(){ var _=this._;
    _.direction=_.target? (_.target.x>this.x)?1:-1 : TEAM.GOALDIRECTION[this.team];
    _.frame.first=_.direction>0?  6 : 0;
    _.frame.last =_.direction>0?  11: 5;
  };
  
  this.seeTarget=function(returnDist) { var _=this._;
    return _.target?
      returnDist?
        Math.abs(_.target.x-this.x)
        : !(Math.abs(_.target.x-this.x)>>_.sight)
      : Infinity;
  };
  
  this.findTarget=function() { var _=this._;
    _.target=undefined;
    // Get all objects possibly within our sight, sort by distance to us
    var h=world.xHash.getNBucketsByCoord(this.x,(_.sight-5)*2+2)
    h.sort(function(a,b) { return Math.abs(this.x-a.x)-Math.abs(this.x-b.x); });
    
    for(var i=0; i<h.length; i++) {
      if(h[i].isDead()) continue;                   // already dead!
      if(Math.abs(h[i].x-this.x)>>_.sight) break;   // can't see closest!      
      
      if(h[i].team!=this.team) { _.target=h[i]; break; }
    }
  }
  
  this.move=function() { var _=this._;
    this.x+=_.direction;
    this.y=world.getHeight(this.x);
    if(!world.isOutside(this)) { return true; }
    else if(TEAM.GOALDIRECTION[this.team]==_.direction) {
      soundManager.play('accomp');
      world.pause();
    }
    // just disappear, walked off the map
    _.action=INFANTRY.ACTION.DEATH1;
    _.health=this.corpsetime=0;    
    return false;
  }
  
  this.attack=function() { var _=this._;
    if(!_.target) return true;
    if(_.target.team==this.team) this.findTarget();
    if(!_.target) return true;
    
    var distTarget=this.seeTarget(1);
    
    // Melee distance: LESS than one body!
    if(distTarget<this.img.w) {
      if($.r()<_.berserk.chance) {
        _.target.takeDamage(_.meleeDmg);        
      }
      return true;
    }
    
    /* Berserk: moving toward the original target for some time without
      regard to self-preservation or where the current target location is!
      once berserk is done, standard actions resume. */
    if($.r()<_.berserk.chance) {
      _.action=INFANTRY.ACTION.MOVEMENT;
      _.berserk.ing=_.berserk.time;      
      return true;
    }
    
    var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
    var strayDY=0;      // deviation in firing angle.
    if(_.projectile==Bullet) {
      if(_.frame.current==_.frame.first+1) soundManager.play('pistol');
      if(!INFANTRY.SHOTFRAME.PISTOL[_.frame.current]) return true;
      accuracy=[0.15,0.85]; strayDY=$.R(-15,15)/100;      
    } else if(_.projectile==SmallRocket) {
      if(distTarget<24) return true;  // don't shoot rockets if too close!
      if(!INFANTRY.SHOTFRAME.ROCKET[_.frame.current]) return true;
      else soundManager.play('rocket');
      accuracy=[0.28,0.68]; strayDY=$.R(-21,21)/100;
    } else {
      return true;      // melee only
    }
    
    // Projectile origin relative to sprite
    var pDY=_.action==INFANTRY.ACTION.ATTACK_PRONE? -2: -4;
    var pDX=_.direction>0?                          2 : -2;
    
    // Distance penalties for chance to hit
    if(distTarget>50){  accuracy[0]-=0.02; accuracy[1]-=0.15; }
    if(distTarget>120){ accuracy[0]-=0.01; accuracy[1]-=0.18; }
    if(distTarget>180){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
    if(distTarget>200){ accuracy[0]-=0.01; accuracy[1]-=0.08; }
    
    // Flight speed = 1<<2.
    world.addPawn(
      new _.projectile(
        this.x+pDX,this.y+pDY,
        this.team,
        _.target,
        _.direction*4,
        ((_.target.y-(_.target.img.h>>1)-(this.y-(this.img.h>>1))-pDY)*4)/distTarget+strayDY,
        accuracy
      )
    );
    _.ammo.clip--;
    return true;
  }
  
  this.corpsetime=180;
  this.takeDamage=function(d){ return this._.health-=d; };
  this.isDead=function(){ return this._.health<=0; };
  
  this.remove=function(){ // silently remove the Pawn.
    this.corpsetime=this._.health=0;
    this._.action=INFANTRY.ACTION.DEATH1;
    this._.frame.current=0;
  };
  
  
  this.getGFX=function(){ var _=this._; return {
      img:    _.imgSheet,
      imgdx:  _.frame.current*this.img.w,
      imgdy:  _.action*this.img.w,
      worldx: this.x-(this.img.w>>1), worldy: this.y-this.img.h+1,
      imgw: this.img.w,               imgh: this.img.h
  }; };
  
  this.alive=function(){ var _=this._;
    if(this.isDead()) {
      if(_.action<INFANTRY.ACTION.DEATH1) {
        _.action=$.R(INFANTRY.ACTION.DEATH1,INFANTRY.ACTION.DEATH2);
        this.correctDirection();
        _.frame.current=_.frame.first;
        soundManager.play('die1,die2,die3,die4'.split(',')[$.R(0,3)]);
      } else {
        if(_.frame.current<_.frame.last) _.frame.current++;
        else this.corpsetime--;
      }
      return false;
    }
    
    // If reloading, don't do anything else.     
    if(_.reload.ing) {
      _.reload.ing--;
      if(!_.reload.ing) _.ammo.clip=_.ammo.max;
      return true;
    } else if(_.ammo.clip==0) {
      _.reload.ing=_.reload.time;
      _.frame.current=_.frame.first;
      return true;
    }
    
    // If berserking, don't try anything else! 
    if(_.berserk.ing) {
      _.berserk.ing--;
      if(_.berserk.ing==0) this.findTarget();
    } else {      
      if(!_.target || _.target.isDead() || !this.seeTarget() )
        this.findTarget();
      else if(_.action==INFANTRY.ACTION.MOVEMENT)
        _.action=$.R(INFANTRY.ACTION.ATTACK_STANDING,INFANTRY.ACTION.ATTACK_PRONE); 
    }
    this.correctDirection();
    
    // Animation loop
    if(++_.frame.current>_.frame.last) _.frame.current=_.frame.first;    
    
    switch(_.action) {
      case INFANTRY.ACTION.MOVEMENT:         return this.move();
      case INFANTRY.ACTION.ATTACK_CROUCHING:
      case INFANTRY.ACTION.ATTACK_PRONE:
      case INFANTRY.ACTION.ATTACK_STANDING:  return this.attack();
    }
    
    return true;
  };
  
}


// Sight in pixels = 1<<_.sight

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
    
    imgSheet:   preloader.getFile('pistol'+TEAM.NAMES[team]),
    projectile: Bullet,
    sight:      7,
    health:     $.R(30,70),
    reload:     { ing:0, time:40 },
    berserk:    { ing:0, time:$.R(8,18), chance:$.r(0.19) },
    ammo:       { clip:2, max:2 },
    meleeDmg:   18
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
    
    imgSheet:   preloader.getFile('rocket'+TEAM.NAMES[team]),
    projectile: SmallRocket,
    sight:      9,
    health:     $.R(60,90),
    reload:     { ing:0, time:$.R(110,160) },
    berserk:    { ing:0, time:$.R(3,20), chance:$.r(0.35) },
    ammo:       { clip:1, max:1 },
    meleeDmg:   23
  };
}
