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
  this.damage=14;
}

MGBullet.prototype=new Projectile;
function MGBullet(x,y,team,target,dx,dy,accuracy) {
  this.x=x,   this.y=y;
  this.dx=dx, this.dy=dy;
  this.accuracy=accuracy;
  this.team=team;
  this.target=target;
  this.imgSheet=preloader.getFile('shells');
  this.img.row=3;

  this.range=60;
  this.damage=$.R(26,42);
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
    
  this.explosion=SmallExplosion;
  this.range=90;;
  this.damage=10;
}