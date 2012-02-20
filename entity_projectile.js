// Projectiles /////////////////////////////////////////////////////////////////
Projectile.prototype=new Pawn;
function Projectile() {  
  this.dx;
  this.dy;
  this.accuracy;
  this.range;
  this.corpsetime=1;
  this.target;
  this.damage=0;
  this.explosion;
  this.img={ w:3, h:3, row:0 };
  this.behavior=Behavior.Library.Projectile;
  
  this.getGFX=function(){
    return {
      img:    this.img.sheet,
      imgdx:  (this.dx>0)? 3:0,
      imgdy:  this.img.row*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-(this.img.h>>1),
      imgw:this.img.w, imgh:this.img.h
    }
  }
  
  this.alive=function(){    
    Behavior.Execute(this.behavior,this);
    return false; // Projectiles cannot become the targets of other entities.
                  // This may change.
  }
}

////////////////////////////////////////////////////////////////////////////////

Bullet.prototype=new Projectile;
function Bullet(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.img.sheet=preloader.getFile('shells');

  this.range=35;
  this.damage=15;
}

MGBullet.prototype=new Projectile;
function MGBullet(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.img.sheet=preloader.getFile('shells');
  
  this.range=60;
  this.damage=$.R(21,32);
}

SmallRocket.prototype=new Projectile;
function SmallRocket(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.img.sheet=preloader.getFile('shells');
  
  this.img.row=1;
  this.explosion=FragExplosion;
  this.range=90;
  this.damage=24;
}

// Used as explosive shrap giblet for now..
MortarShell.prototype=new Projectile;
function MortarShell(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.img.sheet=preloader.getFile('shells');
  
  this.ddy=0.41;
  this.img.row=2;
  this.range=1;
  this.behavior=Behavior.Library.MortarShell;
}

// Fired by SmallTurret
SmallShell.prototype=new Projectile;
function SmallShell(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.img.sheet=preloader.getFile('shells');
  
  this.img.row=2;
  this.explosion=FragExplosion;
  this.range=70;
  this.damage=90;
}


////////////////////////////////////////////////////////////////////////////////

// Homing missile. Fired by a panicked CommCenter
HomingMissile.prototype=new Projectile;
function HomingMissile(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;  
  this.team=team;
  this.img={ w:15, h:15, frame:0, sheet:preloader.getFile('missilered') };
  
  this.maxSpeed=90;
  this.range=180;
  this.dspeed=0.84;
  this.ddy=0.081;
  this._={
    sight:  16,
    target: target
  };
  
  this.getGFX=function(){
    return {
      img:    this.img.sheet,
      imgdx:  this.img.w*this.img.frame,
      imgdy:  0,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-(this.img.h>>1),
      imgw:this.img.w, imgh:this.img.h
    }
  };
  
  this.explode=function(){
    
    world.addPawn(new HEAPExplosion(this.x,this.y));
    var x=this.x+$.R(12,20);
    world.addPawn(new HEAPExplosion(x,world.getHeight(x)));
    var x=this.x-$.R(12,20);
    world.addPawn(new HEAPExplosion(x,world.getHeight(x)));
    var x=this.x-$.R(18,30);
    world.addPawn(new SmallExplosion(x,world.getHeight(x)));
    var x=this.x+$.R(18,30);
    world.addPawn(new SmallExplosion(x,world.getHeight(x)));
    
    this.img.w=80;
    Behavior.Custom.throwShrapnel(this);
    this.img.w=15;
    
    this.range=0;
    this.corpsetime=0;
  };
   
  this.alive=function(){
    if(!this.range) {
      this.explode();
      return this.corpsetime=0;
    }
    
    // Smoke trail
    if(this.range>174)
      world.addPawn(new SmokeCloud(this.x-this.dx,this.y-this.dy));
    
    // Hit enemy.
    var h=world.xHash.getNBucketsByCoord(this.x,0);    
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      if(unit.team==this.team)  continue;
      if(Behavior.Custom.isDead(unit))         continue;
      var dx=this.x-(unit.x-(unit.img.w>>1));
      var dy=this.y-(unit.y-(unit.img.h>>1));      
      if(dx*dx+dy*dy>81)       continue;   // Not close enough!
      this.explode();
      return false;
    }

    // Hit ground
    if(world.isOutside(this)) {
      this.x-=this.dx>>1;
      this.y=world.getHeight(this.x>>0);
      this.explode();
      return false;      
    }      
        
    // Homing.
    if( this.range<171 )
    {  // turn on homing function after delay
      if(this._.target && !Behavior.Custom.isDead(this._.target)) {
        this.dx+=this._.target.x<this.x? -this.dspeed: this.dspeed;
        this.dy+=this._.target.y<this.y? -this.dspeed: this.dspeed;
        if(this.dx*this.dx+this.dy*this.dy>this.maxSpeed) {
          this.dy*=$.R(30,50)/100; // normalize speed with feedback
          this.dx*=$.R(70,80)/100;
        }
      } else {      
        // Gravity
        this.dy+=this.ddy;
        world.xHash.getCrowdedEnemy(this);
      }
    }
    
    // Projectile angle graphics
    // Days since last no division by zero: 10
    if(this.dx==0) this.dx=0.001;
    if(this.dy==0) this.dy=0.001;
    var dydx=Math.abs(this.dy/this.dx);
    var fr; 
    
    if(this.dx<0 && this.dy<0)      fr=[4,3,2,1,0];//[8,7,6,5,4];
    else if(this.dx<0 && this.dy>0) fr=[4,5,6,7,8];//[0,15,14,13,12];//
    else if(this.dx>0 && this.dy>0) fr=[12,11,10,9,8];//[0,1,2,3,4];//
    else                            fr=[12,13,14,15,0];//[8,9,10,11,12];//
    
    this.img.frame=fr[0];
    if(dydx>=0.1989 && dydx<0.6681)  this.img.frame=fr[1];
    if(dydx>=0.6681 && dydx<1.4966)  this.img.frame=fr[2];
    if(dydx>=1.4966 && dydx<5.0273)  this.img.frame=fr[3];
    if(dydx>=5.0273)                 this.img.frame=fr[4];
    
    this.y+=this.dy;
    this.x+=this.dx;    
    
    this.range--;
    return false;
  };
  
}