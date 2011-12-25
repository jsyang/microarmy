var STRUCTURE={
  STATE:{
    GOOD:0,
    BAD:1,
    WRECK:2
  }
};

// Structure classes ///////////////////////////////////////////////////////////
Structure.prototype=new Pawn;
function Structure() {
  this.state=STRUCTURE.STATE.GOOD;
  this.corpsetime=Infinity;
  
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  (this._.direction>0)? this.img.w:0,
      imgdy:  this.state*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  }
  
  this.seeTarget=function(returnDist) { var _=this._;
    var dist=Math.abs(_.target.x-this.x);
    return _.target?
      returnDist?
        dist
        : !(dist>>_.sight) && (dist>this.img.w>>1)
      : 0;
  }
  
  this.findTarget=function(){ var _=this._;
    _.target=undefined;
    // Get all objects possibly within our sight, sort by distance to us
    var h=world.xHash.getNBucketsByCoord(this.x,(_.sight-5)*2+2);
    for(var i=0, minDist=Infinity; i<h.length; i++) {
      var dist=Math.abs(h[i].x-this.x);
      if(h[i].team==this.team) continue;
      if(h[i].isDead()) continue;
      if(!(!(dist>>_.sight) && (dist>this.img.w>>1))) continue;
      if(dist<minDist){
        _.target=h[i]; minDist=Math.abs(h[i].x-this.x);
      }
    }
  };
  
  this.findCrew=function() { var _=this._;
    // Get all objects possibly within our sight
    var h=world.xHash.getNBucketsByCoord(this.x,2);
    for(var i=0; i<h.length; i++) {
      if(!(h[i] instanceof PistolInfantry))       continue;    
      if(h[i].isDead())                           continue;
      if(Math.abs(h[i].x-this.x)>this.img.w>>1)   continue;
      
      if(h[i].team!=this.team) {
        // new ownership!
        if(_.crew.current==0) {
          this.team=h[i].team;
          this._.direction=TEAM.GOALDIRECTION[this.team];
        } else continue;
      }
      
      // absorb health
      _.health.current+=2*h[i]._.health;
      if(_.health.current>_.health.max) _.health.current=_.health.max;
      h[i].remove(); _.crew.current++;
      soundManager.play('sliderack1');
      break;
    }
  };
  
  this.attack=function() { var _=this._;
    if(!_.projectile) return true;
    if(!_.target)     return true;
    if(_.target.team==this.team) this.findTarget();    
    if(!_.target)     return true;
        
    var distTarget=this.seeTarget(1);
    
    // Close quarters melee
    if(distTarget==0) {_.target.takeDamage(2); return true;}
    
    var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
    var strayDY=0;      // deviation in firing angle.
    if(_.projectile==MGBullet) {
      soundManager.play('mgburst');
      accuracy=[0.65,0.35]; strayDY=$.R(-12,12)/100;
    } else if(_.projectile==SmallShell) {
      soundManager.play('turretshot');
      accuracy=[0.50,0.50]; strayDY=$.R(-9,9)/100;
    }
    
    // Projectile origin relative to sprite
    var pDY= -_.shootHeight;
    var pDX=_.direction>0? (this.img.w>>1)-2 : -((this.img.w>>1)-2);
    var pSpeed=!_.projectileSpeed? 4:_.projectileSpeed;
    
    // Distance penalties for chance to hit
    if(distTarget>40){  accuracy[0]-=0.06; accuracy[1]-=0.09; }
    if(distTarget>80){  accuracy[0]-=0.05; accuracy[1]-=0.07; }
    if(distTarget>120){ accuracy[0]-=0.02; accuracy[1]-=0.05; }
    if(distTarget>160){ accuracy[0]-=0.01; accuracy[1]-=0.03; }
    
    world.addPawn(
      new _.projectile(
        this.x+pDX,this.y+pDY,
        this.team,
        _.target,
        _.direction*pSpeed,
        ((_.target.y-(_.target.img.h>>1)-(this.y-(this.img.h>>1))-pDY)*pSpeed)
        /distTarget+strayDY,
        accuracy
      )
    );
    _.ammo.clip--;
    return true;
  }
  
  this.takeDamage=function(d){ return this._.health.current-=d; };  
  // this.remove;
  this.isDead=function(){ return this._.health.current<=0; };
  this.checkState=function(){ var _=this._;
    if(_.health.current<0.6*_.health.max) this.state=STRUCTURE.STATE.BAD;
  };
  
  // Play crumble sound by default.
  this.deathEvent=function(){ soundManager.play('crumble'); };
  
  this.alive=function() { var _=this._;    
    if(this.isDead()) {
      if(this.state!=STRUCTURE.STATE.WRECK) {
        this.state=STRUCTURE.STATE.WRECK;
        this.deathEvent();
      }
      return false;
    } else {
      
      this.checkState();
      
      if(_.crew){
        if(_.crew.current<_.crew.max) this.findCrew();
        if(!_.crew.current){
          // Enemies should not attack an empty pillbox
          this.imgSheet=_.crew.empty; return false;
        } else {
          this.imgSheet=_.crew.occupied(this);
        }        
      }
      
      // Give some reinforcements, if there are any to give
      if(_.reinforce) {        
        if(_.reinforce.next>0) _.reinforce.next--; else {
          // Dump reinforcements faster if shit is hitting the fan.
          _.reinforce.next=$.R(20,
            (_.reinforce.time*_.health.current/_.health.max)>>0);
          
          for(var i=0; i<=this.state; i++) {            
            // Dirty, but working for now--we'll want to build this later
            var typePick=$.R(0,_.reinforce.types.length-1);
            if(_.reinforce.supply[typePick]
               && $.r()<_.reinforce.chances[typePick]) {
              _.reinforce.supply[typePick]--;
              world.addPawn(
                new _.reinforce.types[typePick]
                (this.x,world.getHeight(this.x),this.team)
              );
            }
          }
        }
      }
      
      if(_.projectile) {
        // If reloading, don't do anything else. 
        if(_.ammo.clip==0) {
          // Attack more frequently if better stocked          
          _.reload.ing=_.crew?
            (_.reload.time*(1.2-_.crew.current/_.crew.max))>>0
            :_.reload.time;
          _.ammo.clip=_.ammo.max;
          _.target=undefined;     // reprioritize
          return true;
        }
        if(_.reload.ing) { _.reload.ing--; return true; }
        if(!_.target || _.target.isDead() || !this.seeTarget() )
          this.findTarget();        
        
        // Attack!
        this.attack();
      }
      return true;
    }    
  };
}

////////////////////////////////////////////////////////////////////////////////

CommCenter.prototype=new Structure;
function CommCenter(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.state=STRUCTURE.STATE.GOOD;
  
  this.img={ w:28, h:28, hDist2:196 };
  this.imgSheet=preloader.getFile('comm'+TEAM.NAMES[team]);  
  
  // Large damage has a chance of killing the supply of people inside.
  this.takeDamage=function(d){ var _=this._;
    if(d>18 && $.r()<0.4) {
      var t=$.R(0,1);
      var killed=$.R(2,16);
      if(_.reinforce.supply[t]-killed>0)
        _.reinforce.supply[t]-=killed;
      else
        _.reinforce.supply[t]=0;
    }
    
    // Panic attack: launch homing missile from hell.
    if(_.health.current<0.3*_.health.max && _.ammo.clip>0
       && $.r()<0.13 ) {
      var h=world.xHash.getNBucketsByCoord(this.x,8);
      for(var i=0, maxDist=-Infinity; i<h.length; i++) {
        if(h[i]==_.target)        continue;
        if(h[i].team==this.team)  continue;
        if(h[i].isDead())         continue;
        if(_.target && Math.abs(h[i].x-_.target.x)<60) continue;
        else { _.target=h[i]; maxDist=Math.abs(h[i].x-this.x); break; }
        if(Math.abs(h[i].x-this.x)>maxDist) {          
            _.target=h[i]; maxDist=Math.abs(h[i].x-this.x);
            if($.r()<0.11) break; // just pick this one NOW
        }
      }
      soundManager.play('missile1');
      world.addPawn(
        new HomingMissile(this.x,this.y-20,this.team,_.target,_.direction*4.6,-8.36,0 )
      );
      _.ammo.clip--;
    }
    
    return this._.health.current-=d;
  };
  
  this.deathEvent=function(){
    var w2=this.img.w>>1, h2=this.img.h>>1;
    world.addPawn(new SmallExplosion(this.x,this.y-h2));    
    var shrap=$.R(5,10);
    while(shrap--) world.addPawn(
      new MortarShell(
        this.x+$.R(-w2,w2),this.y-h2,0,0,
        $.R(-4,4)/2,$.R(-18,-12)/4,0)
    );
  };
  
  // Special attack--just for fun!
  this.attack=function() { var _=this._;
    if(!_.target) return true;
    if($.r()<0.0039) {
      soundManager.play('missile1');
      // magic dx,dy numbers!
      world.addPawn(
        new _.projectile(this.x,this.y-20,this.team,_.target,_.direction*4.6,-8.36,0 )
      );
      _.ammo.clip--;
    }
    return true;
  };
  
  this._={
    sight:        16,
    ammo:         { clip: 6, max:6 },
    reload:       { ing:0, time:Infinity },
    projectile:   HomingMissile,
    
    health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
    direction:    TEAM.GOALDIRECTION[team],
    reinforce:    { next: 0, time: 290,
                    types:  [PistolInfantry,RocketInfantry],
                    supply: [120,80],                    
                    chances:[1,0.27]
                  },
    
    target:       undefined
  };
}

Barracks.prototype=new Structure;
function Barracks(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:32, h:12, hDist2:169 };
  this.imgSheet=preloader.getFile('barracks'+TEAM.NAMES[team]);  
  
  // Large damage has a chance of killing the supply of people inside.
  this.takeDamage=function(d){
    if(d>23 && $.r()<0.7) {
      var t=$.R(0,1);
      var killed=$.R(5,10);
      if(this._.reinforce.supply[t]-killed>0)
        this._.reinforce.supply[t]-=killed;
      else
        this._.reinforce.supply[t]=0;
    }
    return this._.health.current-=d;
  };
  
  this.deathEvent=function(){
    soundManager.play('crumble');
    var w2=this.img.w>>1, h2=this.img.h>>1;
    world.addPawn(new SmallExplosion(this.x,this.y-h2));    
    var shrap=$.R(5,10);
    while(shrap--) world.addPawn(
      new MortarShell(
        this.x+$.R(-w2,w2),this.y-h2,0,0,
        $.R(-4,4)/2,$.R(-18,-12)/4,0)
    );
  };
  
  this._={    
    health:       { current:$.R(1800,1950), max:$.R(1950,2500) },
    direction:    TEAM.GOALDIRECTION[team],
    reinforce:    { next: 0, time: 190,
                    types:  [PistolInfantry],
                    supply: [250],
                    chances:[1]
                  },
    
    target:       undefined
  };
}

// Defensive structures

Pillbox.prototype=new Structure;
function Pillbox(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('pillbox_');
  
  // Can only see objects in front of it
  this.findTarget=function(){ var _=this._;
    _.target=undefined;
    var h=world.xHash.getNBucketsByCoord(this.x,(_.sight-5)*2+2);
    for(var i=0, minDist=Infinity; i<h.length; i++) {
      var dist=(h[i].x-this.x);
      if(h[i].team==this.team)              continue;
      if(h[i].isDead())                     continue;
      if(_.direction*(h[i].x-this.x)<0)     continue;
      if(Math.abs(h[i].x-this.x)>>_.sight)  continue;      
      if(Math.abs(h[i].x-this.x)<minDist){
        _.target=h[i]; minDist=Math.abs(h[i].x-this.x);
      }
    }
  };
  
  // Large damage has a chance of killing everyone inside.
  this.takeDamage=function(d){
    if(d>24 && $.r()<0.23) {
      var killed=$.R(2,this._.crew.max);
      if(this._.crew.current-killed>0)
        this._.crew.current-=killed;
      else
        this._.crew.current=0;
    }
    return this._.health.current-=d;
  };
  
  this._={    
    sight:        7,
    health:       { current:$.R(800,900), max:$.R(800,1100) },
    projectile:   MGBullet,
    direction:    TEAM.GOALDIRECTION[team],
    reload:       { ing:0, time: 160 },
    ammo:         { clip:6, max: 6 },
    shootHeight:  5,
    crew:         { current: 0, max:8,
                    occupied: function(o){
                      return preloader.getFile('pillbox'+TEAM.NAMES[o.team]);
                    },
                    empty: preloader.getFile('pillbox_') },

    target:       undefined
  }
}

SmallTurret.prototype=new Structure;
function SmallTurret(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:22, h:9, hDist2:90 };
  this.imgSheet=preloader.getFile('turret'+TEAM.NAMES[team]);
  
  // Rotation handling
  this.checkState=function(){ var _=this._;
    if(_.health.current<0.5*_.health.max) this.state=STRUCTURE.STATE.BAD;
    if(!_.target) return;    
    if((_.target.x-this.x)*_.direction>=0) return;
    if(!_.turn.ing) {
      _.projectile=undefined;
      _.turn.ing=1;
      _.turn.current=0;
    } else {
      _.turn.current++;
      if(_.turn.current>_.turn.last) {
        _.projectile=SmallShell;
        _.turn.ing=_.turn.current=0;
        _.direction*=-1;
        _.target=undefined;
      }
    }
  };  
  
  // Rotation gfx
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  (this._.direction>0)? this.img.w:0,
      imgdy:
        this.state!=STRUCTURE.STATE.WRECK?
          this.state*45+this.img.h*this._.turn.current
          :90,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  };
  
  this.deathEvent=function(){
    soundManager.play('crumble');
    world.addPawn(new SmallExplosion(this.x,this.y-(this.img.h>>1)));    
  };
  
  this._={
    sight:            8,
    health:           { current:$.R(1900,2100), max:$.R(2100,2300) },
    projectile:       SmallShell,
    projectileSpeed:  7,
    direction:        TEAM.GOALDIRECTION[team],
    reload:           { ing:0, time: 90 },
    ammo:             { clip:0, max: 1 },
    shootHeight:      6,
    turn:             { ing: 0, current:0, last:4 },    
    
    target:       undefined
  }   
}