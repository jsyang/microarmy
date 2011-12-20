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
      imgdx:  (this._.direction>0)? this.w:0,
      imgdy:  this.state*this.h,
      worldx: this.x-(this.w>>1),
      worldy: this.y-this.h,
      imgw:this.w, imgh:this.h
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
  
  this.attack=function() { var _=this._;
    if(!_.target) return true;
    var distTarget=this.seeTarget(1);
    
    var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
    var strayDY=0;      // deviation in firing angle.
    if(_.projectile==MGBullet) {
      soundManager.play('mgburst');
      accuracy=[0.20,0.35]; strayDY=$.R(-11,11)/100;
    }
    
    // Projectile origin relative to sprite
    var pDY= -_.shootHeight;
    var pDX=_.direction>0? this.w>>1-2 : -(this.w>>1-2);
    
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
        ((_.target.y-this.y-pDY)<<2)/distTarget+strayDY,
        accuracy
      )
    );
    _.ammo.clip--;
    return true;
  }
  
  this.takeDamage=function(d){ return this._.health.current-=d; };  
  this.kill=function(){ return this._.health.current=0; };
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
      // Give some reinforcements
      if(_.reinforce) {
        if(_.reinforce.next) _.reinforce.next--; else {
          _.reinforce.next=$.R(20,_.reinforce.time);
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
      
      // If reloading, don't do anything else. 
      if(_.ammo.clip==0) {
        _.reload.ing=_.reload.time;
        _.ammo.clip=_.ammo.max;
        return true;
      }
      if(_.reload.ing) { _.reload.ing--; return true; }      
      if(!_.target || _.target.isDead() || !this.seeTarget() ) this.findTarget();
      return this.attack();
    }    
  };
}

CommCenter.prototype=new Structure;
function CommCenter(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.state=STRUCTURE.STATE.GOOD;
  
  this.w=28; this.h=28;
  this.imgSheet=preloader.getFile('comm'+TEAM.NAMES[team]);  
  
  this._={    
    sight:        8,
    health:       { current:$.R(500,1200), max:$.R(600,1300) },
    projectile:   MGBullet,
    direction:    TEAM.GOALDIRECTION[team],
    reload:       { ing:0, time: 180 },
    ammo:         { clip:6, max: 6 },
    shootHeight:  12,
    reinforce:    { next: 0, time: 120,
                    types:  [PistolInfantry,RocketInfantry],
                    supply: [250,40],
                    chances:[1,0.3]
                  },
    
    target:       undefined
  }
}