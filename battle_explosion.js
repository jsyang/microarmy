Explosion = Pawn.extend({
  init:function(params){
    this._=$.extend({
      damage:       0,
      damageDecay:  2,
      corpsetime:   1,
      frame:        {current:0, last:0}
    },params);
    
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  _.frame.current*_.img.w,
      imgdy:  0,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-(_.img.h>>1),
      imgw:_.img.w,
      imgh:_.img.h
    }
  },
  alive:function(){ var _=this._;
    if(_.frame.current==_.frame.last) return _.corpsetime=0;
    _.frame.current++;
    var h=world._.xHash.getNBucketsByCoord(_.x,2);
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      var dx=_.x-(unit._.x-(unit._.img.w>>1));     // point object.
      var dy=_.y-(unit._.y-(unit._.img.h>>1));      
      if(dx*dx+dy*dy>_.img.hDist2) continue;   // Not close enough!
      Behavior.Custom.takeDamage.call(unit,_.damage);
      // Make sure not to "give" anyone health because of this.
      if(_.damage-_.damageDecay<0) _.damage=0;
      else _.damage-=_.damageDecay;
    }    
    return false; // can't target explosions.
  }
});

////////////////////////////////////////////////////////////////////////////////
// Explosions in ascending order of total potential damage

FragExplosion = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame: { current:0, last:8 },
      img:   { w:41, h:35, hDist2: 400, sheet: preloader.getFile('exp1') },
      damage:$.R(28,55)
    },params);
    this._super(this._);
    soundManager.play('expfrag');
  }
}); 

SmallExplosion = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:0, last:12 },
      img:          {w:25, h:17, hDist2: 160, sheet: preloader.getFile('exp2') },
      damage:       $.R(12,29),
      damageDecay:  1
    },params);
    this._super(this._);
    soundManager.play('expsmall');
  }
});

HEAPExplosion = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:0, last:22 },
      img:          { w:41, h:28, hDist2: 460, sheet: preloader.getFile('exp2big') },
      damage:       $.R(65,95),
      damageDecay:  1
    },params);
    this._super(this._);
    soundManager.play('exp2big');
  }
});

////////////////////////////////////////////////////////////////////////////////
// Special effects

SmokeCloud = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last:22 },
      img:          { w:19, h:17, sheet: preloader.getFile('smoke') },
      damageDecay:  1
    },params);
    this._super(this._);
  },
  alive:function(){ var _=this._;
    if(_.frame.current==_.frame.last) return _.corpsetime=0;
    _.frame.current++;
    return false;
  }
});

Flame = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:$.R(0,4), last:4 },
      img:          { w:6, h:4, sheet: preloader.getFile('firesmall'+$.R(0,2)) },
      cycles:       $.R(2,20)
    },params);
    this._super(this._);
  },
  alive:function(){ var _=this._;
    if(_.frame.current==_.frame.last) {
      _.frame.current = -1;
      _.cycles--;
      if(_.cycles==0) return _.corpsetime=0;
    }
    _.frame.current++;
    return false;
  }
});
