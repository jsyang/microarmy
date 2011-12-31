var VEHICLE={
  ACTION:{
    IDLING:-1,
    MOVING:0,
    TURNING:1,
    WRECK:2,
    MAX:4
  }
};


////////////////////////////////////////////////////////////////////////////////

Vehicle.prototype=new Pawn;
function Vehicle() {
  
  this.seeTarget=function(returnDist) { var _=this._;
    return _.target?
      returnDist?
        Math.abs(_.target.x-this.x)
        : !(Math.abs(_.target.x-this.x)>>_.sight)
      : 0;
  };
  
  this.findTarget=function() { var _=this._;
    _.target=undefined;
    // Get all objects possibly within our sight, don't care about dist
    var h=world.xHash.getNBucketsByCoord(this.x,(_.sight-5)*2+2)
    for(var i=0, minDist=Infinity; i<h.length; i++) {
      if(h[i].team==this.team) continue;
      if(h[i].isDead()) continue;                   // already dead!
      if(Math.abs(h[i].x-this.x)>>_.sight) continue;   // can't see closest!      
      if(Math.abs(h[i].x-this.x)<minDist){
        _.target=h[i]; minDist=Math.abs(h[i].x-this.x);
      }
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
    this.remove();
    return false;
  }
  
  this.attack=function() { var _=this._;
    if(!_.projectile) return true;
    var distTarget=this.seeTarget(1);
    
    // Melee distance: LESS than one body!
    // no melee for vehicles
    
    var accuracy=[0,0]; // chance to hit, [periphery, target bonus]
    var strayDY=0;      // deviation in firing angle.
    var fSpeed=0;
    if(_.projectile==MGBullet) {
      if(_.ammo.clip==_.ammo.max) soundManager.play('mgburst');
      accuracy=[0.65,0.35]; strayDY=$.R(-15,15)/100; fSpeed=4;
    }
    
    // Projectile origin relative to sprite
    var pDY=-this.img.h>>1;
    var pDX=_.direction*4;
    
    // Distance penalties for chance to hit
    // this should probably be moved inside the projectile class
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
  
  this.corpsetime=240;
  this.takeDamage=function(d){ return this._.health-=d; };
  this.isDead=function(){ return this._.health<=0; };
  
  this.remove=function(){ // silently remove the Pawn.
    this.corpsetime=this._.health=0;
    this._.action=VEHICLE.ACTION.WRECK;
    this._.frame.current=0;
  };
  
  // Rotation gfx
  this.getGFX=function(){ var _=this._;
    return {
      img:    this.img.sheet,
      imgdx:  _.direction>0? this.img.w:0,
      imgdy:
        _.action==VEHICLE.ACTION.WRECK?
          6*this.img.h
          :_.action==VEHICLE.ACTION.TURNING?
            (_.frame.current+3)*this.img.h
            :_.frame.current*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  };

  this.alive=function(){ var _=this._;
    if(this.isDead()) {
      if(_.action<VEHICLE.ACTION.WRECK) {
        _.action=VEHICLE.ACTION.WRECK;
        //soundManager.play('die1,die2,die3,die4'.split(',')[$.R(0,3)]);        
      }
      return false;
    } else {
    
      // If reloading, don't do anything else.     
      if(_.reload.ing) { _.reload.ing--; return true; }
      else if(_.ammo.clip==0) {
        _.reload.ing=_.reload.time;
        _.ammo.clip=_.ammo.max;
        return true;
      }
      
      // Try to find a valid target!
      if(!_.target || _.target.isDead() ||
         !this.seeTarget() || _.target.team==this.team) this.findTarget();
      
      if(_.target) {
        // Handle rotation
        if(_.target && (_.target.x-this.x)*_.direction<0) {
          if(!_.turn.ing) {            
            _.turn.ing=1;
            _.turn.current=0;
          } else {
            _.turn.current++;
            if(_.turn.current>_.turn.last) {
              _.turn.ing=_.turn.current=0;
              _.direction*=-1;
            }            
          }
        } else return this.attack();
      } else this.move();
      
      // Animation loop -- only for moving or turning, not attacking
      if(_.action==VEHICLE.ACTION.MOVING || _.action==VEHICLE.ACTION.TURNING)
        if(++_.frame.current>_.frame.last)
          _.frame.current=_.frame.first;
  
      return true;
    }
  };  
}



APC.prototype=new Vehicle;
function APC(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.img={
    w:21, h:11, hDist2: 81, sheet: preloader.getFile('apc'+TEAM.NAMES[team])
  };
  
  // to do: this object has to do with unit-specific behavior,
  // use selectors and decorators to build a nice behavior tree
  this._={
    action:     VEHICLE.ACTION.MOVING,
    frame:      { current:0, first:0, last:2 },
    target:     undefined,
    direction:  TEAM.GOALDIRECTION[team],
    
    projectile: MGBullet,
    turn:       { ing:0, current:0, last: 2 },
    sight:      7,
    health:     $.R(560,720),
    reload:     { ing:0, time:40 },
    ammo:       { clip:6, max:6 }
  };

}
