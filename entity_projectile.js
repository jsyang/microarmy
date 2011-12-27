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
  this.imgSheet;
  this.img={ w:3, h:3, row:0 };
  
  
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  (this.dx>0)? 3:0,
      imgdy:  this.img.row*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-(this.img.h>>1),
      imgw:this.img.w, imgh:this.img.h
    }
  }
  
  this.alive=function(){    
    
    // Out of bounds or hit the ground!
    if(world.isOutside(this)) this.range=0;
    if(!this.range) {
      this.corpsetime=0;
      return false;
    } else { this.range--; }
    
    this.y+=this.dy;
    this.x+=this.dx;
    
    
    var h=world.xHash.getNBucketsByCoord(this.x,0);    
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      if(unit.team==this.team)  continue;
      if(unit.isDead())         continue;      
      
      var dx=this.x-unit.x;
      var dy=this.y-(unit.y-(unit.img.h>>1));
      
      var chanceToHit=this.accuracy[0];
      chanceToHit+=(unit==this.target)? this.accuracy[1]:0;
      
      if(unit instanceof Infantry) {
        switch(unit._.action) { // Stance affects chance to be hit
          case INFANTRY.ACTION.ATTACK_PRONE:      chanceToHit-=0.11;
          case INFANTRY.ACTION.ATTACK_CROUCHING:  chanceToHit-=0.06;
        }        
      }      

      if(dx*dx+dy*dy>unit.img.hDist2)   continue;
      if($.r()>chanceToHit) continue;
      // We've hit something!
      if(this.explosion)    world.addPawn(new this.explosion(this.x,this.y));
      unit.takeDamage(this.damage);      
      return this.range=this.corpsetime=0;
    }
    return false;  // keep flying, you crazy bird
  }
}

Bullet.prototype=new Projectile;
function Bullet(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;  
  this.imgSheet=preloader.getFile('shells');

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
  this.imgSheet=preloader.getFile('shells');
    
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
  this.imgSheet=preloader.getFile('shells');
  
  this.img.row=1    
  this.explosion=FragExplosion;
  this.range=90;
  this.damage=24;
}

// Used as shrap for now..
MortarShell.prototype=new Projectile;
function MortarShell(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.imgSheet=preloader.getFile('shells');
  // ^^^ might have to clean that code up... a lot of repetition
  
  this.ddy=0.41;
  this.img.row=2;
  this.range=1;
  
  // Hit on contact with ground
  this.alive=function(){
    if(this.range==0) return false;
    if(world.isOutside(this)) {      
      this.x-=this.dx>>1;
      this.y=world.getHeight(this.x>>0);
      this.range=0;
      world.addPawn(new FragExplosion(this.x,this.y));
      return this.corpsetime=0;
    }
    this.y+=this.dy;
    this.x+=this.dx;
    this.dy+=this.ddy;
    return false;
  };
}

// Used as shrap for now..
SmallShell.prototype=new Projectile;
function SmallShell(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.imgSheet=preloader.getFile('shells');
  
  this.img.row=2;
  this.explosion=FragExplosion;
  this.range=70;
  this.damage=90;
}

// Homing missile. Fired by a panicked CommCenter
HomingMissile.prototype=new Projectile;
function HomingMissile(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;  
  this.team=team;
  this.target=target;
  this.img={ w:15, h:15, frame:0, sheet:preloader.getFile('missilered') };
  
  this.maxSpeed=90;
  this.range=180;
  this.dspeed=0.84;
  this.ddy=0.21;
  
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
    this.range=0;
    this.corpsetime=0;
  };
  
  this.findTarget=function(){
    this.target=undefined;
    var h=world.xHash.getNBucketsByCoord(this.x,18);
    for(var i=0, minDist=Infinity; i<h.length; i++) {
      if(h[i].team==this.team) continue;
      if(h[i].isDead()) continue;
      if(Math.abs(h[i].x-this.x)<minDist){
        this.target=h[i]; minDist=Math.abs(h[i].x-this.x);
      }
    }
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
      if(unit.isDead())         continue;
      var dx=this.x-(unit.x-(unit.img.w>>1));
      var dy=this.y-(unit.y-(unit.img.h>>1));      
      if(dx*dx+dy*dy>100)       continue;   // Not close enough!
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
      if(this.target && !this.target.isDead()) {
        this.dx+=this.target.x<this.x? -this.dspeed: this.dspeed;
        this.dy+=this.target.y<this.y? -this.dspeed: this.dspeed;
        if(this.dx*this.dx+this.dy*this.dy>this.maxSpeed) {
          this.dy*=$.R(30,50)/100; // need this to control better
          this.dx*=$.R(70,80)/100;
        }
      } else {      
        // Gravity
        this.dy+=this.ddy;
        this.findTarget();
      }
    }
    
    // Projectile angle graphics
    // Days since last no division by zero: 10
    if(this.dx==0) this.dx=0.001;
    if(this.dy==0) this.dy=0.001;
    var dydx=Math.abs(this.dy/this.dx);
    var fr; // cover 4 quadrants
    
    if(this.dx<0 && this.dy<0)      fr=[4,3,2,1,0];//[8,7,6,5,4];
    else if(this.dx<0 && this.dy>0) fr=[4,5,6,7,8];//[0,15,14,13,12];//
    else if(this.dx>0 && this.dy>0) fr=[12,11,10,9,8];//[0,1,2,3,4];//
    else                            fr=[12,13,14,15,0];//[8,9,10,11,12];//
    
    this.img.frame=fr[0];
    if(dydx>=0.1989 && dydx<0.6681)  this.img.frame=fr[1];
    if(dydx>=0.6681 && dydx<1.4966)  this.img.frame=fr[2];
    if(dydx>=1.4966 && dydx<5.0273)  this.img.frame=fr[3];
    if(dydx>=5.0273)                 this.img.frame=fr[4];
    //console.log(this.img.frame);
    
    this.y+=this.dy;
    this.x+=this.dx;    
    
    this.range--;
    return false;
  };
  
}