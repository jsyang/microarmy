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
      : Infinity;
  }
  
  this.findTarget=function(){ var _=this._;
    _.target=undefined;
    // Get all objects possibly within our sight, sort by distance to us
    var h=world.xHash.getNBucketsByCoord(this.x, _.sight-6+2)
    h.sort(function(a,b) { return Math.abs(this.x-a.x)-Math.abs(this.x-b.x); });    
    for(var i=0; i<h.length; i++) {
      if(h[i].isDead())                     continue;   // already dead!
      if(Math.abs(h[i].x-this.x)>>_.sight)  break;      // can't see closest!         
      if(h[i].team!=this.team) { _.target=h[i]; break; }
    }
  };
  
  this.findCrew=function() { var _=this._;
    // Get all objects possibly within our sight, sort by distance to us
    var h=world.xHash.getNBucketsByCoord(this.x,2)
    h.sort(function(a,b) { return Math.abs(this.x-a.x)-Math.abs(this.x-b.x); });    
    for(var i=0; i<h.length; i++) {
      if(!(h[i] instanceof PistolInfantry)) continue;    
      if(h[i].isDead())               continue;
      if(Math.abs(h[i].x-this.x)>(this.img.w>>1))  break;  // can't see closest!
      
      // new ownership!
      if(h[i].team!=this.team && !_.crew.current) {
        this.team=h[i].team;
        this._.direction=TEAM.GOALDIRECTION[this.team];
      }
      
      // absorb health
      _.health.current+=2*h[i]._.health;
      if(_.health.current>_.health.max) _.health.current=_.health.max;
      h[i].remove(); _.crew.current++;
      soundManager.play('sliderack1');
    }
  };
  
  this.attack=function() { var _=this._;
    if(!_.projectile) return true;
    if(!_.target)     return true;
    if(_.target.team==this.team) this.findTarget();    
    if(!_.target)     return true;
    var distTarget=this.seeTarget(1);
    
    var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
    var strayDY=0;      // deviation in firing angle.
    if(_.projectile==MGBullet) {
      soundManager.play('mgburst');
      accuracy=[0.45,0.55]; strayDY=$.R(-11,11)/100;
    }
    
    // Projectile origin relative to sprite
    var pDY= -_.shootHeight;
    var pDX=_.direction>0? (this.img.w>>1)-2 : -((this.img.w>>1)-2);
    
    // Distance penalties for chance to hit
    if(distTarget>40){  accuracy[0]-=0.01; accuracy[1]-=0.09; }
    if(distTarget>80){  accuracy[0]-=0.02; accuracy[1]-=0.03; }
    if(distTarget>120){ accuracy[0]-=0.05; accuracy[1]-=0.02; }
    if(distTarget>160){ accuracy[0]-=0.06; accuracy[1]-=0.01; }
    
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
  
  this.alive=function() { var _=this._;    
    if(this.isDead()) {
      if(this.state!=STRUCTURE.STATE.WRECK) {
        this.state=STRUCTURE.STATE.WRECK;
        soundManager.play('crumble');
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
      if(_.reinforce && $.sum(_.reinforce.supply)>1) {
        if(_.reinforce.next) _.reinforce.next--; else {
          _.reinforce.next=$.R(20,_.reinforce.time);
          // Dump reinforcements faster if badly damaged.
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
          _.reload.ing=(_.reload.time*(1.1-_.crew.current/_.crew.max))>>0;
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
      var killed=$.R(1,5);
      if(this._.reinforce.supply[t]-killed>0)
        this._.reinforce.supply[t]-=killed;
      else
        this._.reinforce.supply[t]=0;
    }
    return this._.health.current-=d;
  };
  
  this._={    
    health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
    direction:    TEAM.GOALDIRECTION[team],
    reinforce:    { next: 0, time: 120,
                    types:  [PistolInfantry,RocketInfantry],
                    supply: [250,80],                    
                    chances:[1,0.4]
                  },
    
    target:       undefined
  }
}

Pillbox.prototype=new Structure;
function Pillbox(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.state=STRUCTURE.STATE.GOOD;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('pillbox_');//+TEAM.NAMES[team]);  
  
  // Large damage has a chance of killing everyone inside.
  this.takeDamage=function(d){
    if(d>18 && $.r()<0.23) {
      var killed=$.R(2,this._.crew.max);
      if(this._.crew.current-killed>0)
        this._.crew.current-=killed;
      else
        this._.crew.current=0;
    }
    return this._.health.current-=d;
  };
  
  this._={    
    sight:        8,
    health:       { current:$.R(700,800), max:$.R(700,900) },
    projectile:   MGBullet,
    direction:    TEAM.GOALDIRECTION[team],
    reload:       { ing:0, time: 180 },
    ammo:         { clip:6, max: 6 },
    shootHeight:  5,
    crew:         { current: 0, max:8,
                    occupied: function(owner){
                      return preloader.getFile('pillbox'+TEAM.NAMES[owner.team]);
                    },
                    empty: preloader.getFile('pillbox_') },

    target:       undefined
  }
}