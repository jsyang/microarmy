// Explosions and Special Effects //////////////////////////////////////////////
Explosion.prototype=new Pawn;
function Explosion() {
  this.damage=0;
  this.damageDecay=2;
  this.imgSheet;
  this.corpsetime=1;
  this.frame={ current:0, last:0 };
  this.radius;
  
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  this.frame.current*this.img.w,
      imgdy:  0,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-(this.img.h>>1),
      imgw:this.img.w, imgh:this.img.h
    }
  };
  
  this.alive=function(){
    if(this.frame.current++>this.frame.last) return this.corpsetime=0;
    var h=world.xHash.getNBucketsByCoord(this.x,2);
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      var dx=this.x-(unit.x-(unit.img.w>>1));     // point object.
      var dy=this.y-(unit.y-(unit.img.h>>1));      
      if(dx*dx+dy*dy>this.img.hDist2) continue;   // Not close enough!
      unit.takeDamage(this.damage);
      // Make sure not to "give" anyone health because of this.
      if(this.damage-this.damageDecay<0) this.damage=0;
      else this.damage-=this.damageDecay;
    }    
    return false;
  };
}

SmallExplosion.prototype=new Explosion;
function SmallExplosion(x,y) {
  this.x=x; this.y=y;
  this.imgSheet=preloader.getFile('exp1');
  this.frame={ current:0, last:12 };
  this.img={w:41, h:35, hDist2: 400 };
  this.damage=24;
  soundManager.play('expsmall');
}

////////// to do
FragExplosion.prototype=new Explosion;
function FragExplosion(x,y) {
  this.x=x; this.y=y;
  this.imgSheet=preloader.getFile('exp2');
  this.frame={ current:0, last:8 };
  this.img={w:25, h:17, hDist2: 160 };
  this.damage=12;
  this.damageDecay=1;
  soundManager.play('expfrag');
}