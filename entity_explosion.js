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
      img:    this.img.sheet,
      imgdx:  this.frame.current*this.img.w,
      imgdy:  0,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-(this.img.h>>1),
      imgw:this.img.w, imgh:this.img.h
    }
  };
  
  this.alive=function(){
    if(this.frame.current++>this.frame.last) return this.corpsetime=0;
    var h=world.xHash.getNBucketsByCoord(this.x,4);
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
  this.frame={ current:0, last:12 };
  this.img={ w:41, h:35, hDist2: 400, sheet: preloader.getFile('exp1') };
  this.damage=$.R(28,55);
  soundManager.play('expsmall');
}

FragExplosion.prototype=new Explosion;
function FragExplosion(x,y) {
  this.x=x; this.y=y;
  this.frame={ current:0, last:8 };
  this.img={w:25, h:17, hDist2: 160, sheet: preloader.getFile('exp2') };
  this.damage=$.R(12,29);
  this.damageDecay=1;
  soundManager.play('expfrag');
}

HEAPExplosion.prototype=new Explosion;
function HEAPExplosion(x,y) {
  this.x=x; this.y=y;
  this.frame={ current:0, last:22 };
  this.img={w:41, h:28, hDist2: 460, sheet: preloader.getFile('exp2big') };
  this.damage=$.R(65,95);
  this.damageDecay=1;
  soundManager.play('exp2big');
}

////////////////////////////////////////////////////////////////////////////////

SmokeCloud.prototype=new Explosion;
function SmokeCloud(x,y) {
  this.x=x; this.y=y;
  this.frame={ current:-1, last:22 };
  this.img={w:19, h:17, sheet: preloader.getFile('smoke') };
  this.alive=function(){
    if(this.frame.current++>this.frame.last) return this.corpsetime=0;
    return false;
  };
}