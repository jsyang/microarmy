// Explosions and Special Effects //////////////////////////////////////////////
Explosion.prototype=new Pawn;
function Explosion() {
  this.damage=0;
  this.imgSheet;
  this.corpsetime=1;
  this.frame={ current:0, last:0 };
  this.w;
  this.h;
  this.radius;
  
  this.setRadius=function(){ return this.radius=Math.max(this.w,this.h)>>1; };
  
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  this.frame.current*this.w,
      imgdy:  0,
      worldx: this.x-(this.w>>1),
      worldy: this.y-(this.h>>1),
      imgw:this.w, imgh:this.h
    }
  };
  
  this.alive=function(){
    if(this.frame.current++>this.frame.last) return this.corpsetime=0;
    var h=world.xHash.getNBucketsByCoord(this.x,2);
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      var dx=this.x-unit.x;
      var dy=this.y-unit.y;
      
      
      if(unit instanceof Infantry) {
        dx-=INFANTRY.CENTERADJUST.X;
        dy-=INFANTRY.CENTERADJUST.Y;
      }
      if(dx*dx+dy*dy>this.radius*this.radius) continue;  // Not close enough!
      unit.takeDamage(this.damage);
    }    
    return false;
  };
}

SmallExplosion.prototype=new Explosion;
function SmallExplosion(x,y) {
  this.x=x;
  this.y=y;
  this.imgSheet=preloader.getFile('exp1');
  this.frame={ current:0, last:12 };
  this.w=41, this.h=35;
  this.damage=18;
  this.setRadius();
  soundManager.play('expsmall');
}