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
    return _.target?
      returnDist?
        Math.abs(_.target.x-this.x)
        : !(Math.abs(_.target.x-this.x)>>_.sight)
      : 0;
  }
  
  this.findTarget=function(){ var _=this._;
    _.target=undefined;
    // Get all objects possibly within our sight, sort by distance to us
    var h=world.xHash.getNBucketsByCoord(this.x,(_.sight-5)*2+2);
    for(var i=0, minDist=Infinity; i<h.length; i++) {
      if(h[i].team==this.team)              continue;
      if(h[i].isDead())                     continue;
      if(Math.abs(h[i].x-this.x)>>_.sight)  continue;
      if(Math.abs(h[i].x-this.x)<minDist){
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
      if(Math.abs(h[i].x-this.x)>(this.img.w>>1)) continue;
      
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
    }
    
    // Projectile origin relative to sprite
    var pDY= -_.shootHeight;
    var pDX=_.direction>0? (this.img.w>>1)-2 : -((this.img.w>>1)-2);
    
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
        _.direction*4,
        ((_.target.y-(_.target.img.h>>1)-(this.y-(this.img.h>>1))-pDY)*4)/distTarget+strayDY,
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
    if(_.health.current<0.7*_.health.max) this.state=STRUCTURE.STATE.BAD;
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
          _.reinforce.next=$.R(20,_.reinforce.time);
          
          // Dump reinforcements faster if shit is hitting the fan.
          if(_.health.current<_.health.max*0.4) _.reinforce.next-=$.R(8,18);
          if(_.health.current<_.health.max*0.2) _.reinforce.next-=$.R(16,26);
          
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
          _.reload.ing=(_.reload.time*(1.2-_.crew.current/_.crew.max))>>0;
          _.ammo.clip=_.ammo.max;
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
  this.takeDamage=function(d){
    if(d>18 && $.r()<0.4) {
      var t=$.R(0,1);
      var killed=$.R(2,16);
      if(this._.reinforce.supply[t]-killed>0)
        this._.reinforce.supply[t]-=killed;
      else
        this._.reinforce.supply[t]=0;
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
  
  this._={    
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
                    supply: [200],
                    chances:[1]
                  },
    
    target:       undefined
  };
}

////////////////////////////////////////////////////////////////////////////////

Pillbox.prototype=new Structure;
function Pillbox(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('pillbox_');//+TEAM.NAMES[team]);  
  
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