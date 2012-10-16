PROJECTILE = {
  SHEET:{
    BULLET:       0,
    MGBULLET:     0,
    SMALLROCKET:  1,
    MORTARSHELL:  2,
    SMALLSHELL:   2  
  }
};

Projectile = Pawn.extend({
  init:function(params){
    this._=$.extend({
      dx:         undefined,
      dy:         undefined,
      accuracy:   undefined,
      range:      undefined,
      corpsetime: 1,
      target:     undefined,
      explosion:  undefined,
      img:        { w:3, h:3, sheet:preloader.getFile('shells') },
      behavior:   Behavior.Library.Projectile
    },params);
    this._super(this._);
  },
  alive:function(){
    Behavior.Execute(this._.behavior, this);
    return false; // Other pawns can't target Projectiles
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  (_.dx>0)? 3:0,
      imgdy:  _.img.row*_.img.h,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-(_.img.h>>1),
      imgw:_.img.w, imgh:_.img.h
    }
  }
});

////////////////////////////////////////////////////////////////////////////////

Bullet = Projectile.extend({
  init:function(params){
    this._=$.extend({
      range: 35,
      damage:15
    },params);
    this._super(this._);
    this._.img.row=PROJECTILE.SHEET.BULLET;
  }
});

MGBullet = Projectile.extend({
  init:function(params){
    this._=$.extend({
      range: 60,
      damage:$.R(21,32)
    },params);
    this._super(this._);
    this._.img.row=PROJECTILE.SHEET.BULLET;
  }
});

SmallRocket = Projectile.extend({
  init:function(params){
    this._=$.extend({
      explosion: SmallExplosion,
      range: 90,
      damage:24
    },params);
    this._super(this._);
    this._.img.row=PROJECTILE.SHEET.SMALLROCKET;
  }
});

// Used as explosive shrap giblet for now..
MortarShell = Projectile.extend({
  init:function(params){
    this._=$.extend({
      behavior: Behavior.Library.MortarShell,
      range: 1,
      ddy:0.41 // delta dy
    },params);
    this._super(this._);
    this._.img.row=PROJECTILE.SHEET.MORTARSHELL;
  }
});

// Fired by SmallTurret
SmallShell = Projectile.extend({
  init:function(params){
    this._=$.extend({
      explosion: SmallExplosion,
      range: 70,
      damage:90
    },params);
    this._super(this._);
    this._.img.row=PROJECTILE.SHEET.SMALLSHELL;
  }
});

// Is laid / built by Engineer
SmallMine = Projectile.extend({
  init:function(params){
    this._=$.extend({
      accuracy: [0.6, 0],
      behavior: Behavior.Library.SmallMine,
      explosion:FragExplosion,
      damage:   20,
      
      img:      {w:5,h:2,row:0}
    },params);
    this._super(this._);
    this._.img.sheet=preloader.getFile('mine'+TEAM.NAMES[this._.team]);
  }
});

////////////////////////////////////////////////////////////////////////////////
// Specials.

// todo: clean this up.
HomingMissile = Projectile.extend({
  init:function(params){
    this._=$.extend({
      img:            { w:15, h:15, frame:0, sheet:preloader.getFile('missilered') },
      maxSpeed:       90,
      range:          280,
      rangeTravelled: 0,
      ddy:            0.081,
      dspeed:         0.84,
      sight:          8,
      homingDelay:    12,
      target:         undefined
    },params);
    this._super(this._);
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  _.img.w*_.img.frame,
      imgdy:  0,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-(_.img.h>>1),
      imgw:_.img.w,
      imgh:_.img.h
    }
  },
  explode:function(){ var _=this._;
    world.add(new SmallExplosion({
      x: _.x,
      y: _.y
    }));
    var x=_.x+$.R(12,20); var y=_.y+$.R(-20,20);
    if(y>world.height(x)) y=world.height(x);
    world.add(new HEAPExplosion({
      x: x,
      y: y
    }));
    var x=_.x-$.R(12,20); var y=_.y+$.R(-20,20);
    if(y>world.height(x)) y=world.height(x);
    world.add(new HEAPExplosion({
      x: x,
      y: y
    }));

    // smoke..
    for(var i=12; i--;) {
      var x=_.x+$.R(-60,60); var y=_.y+$.R(-20,20);
      if(y>world.height(x)) y=world.height(x);
      world.add(new SmokeCloud({
        x: x,
        y: y
      }));
    }

    var x=_.x+$.R(18,30); var y=_.y+$.R(-20,20);
    if(y>world.height(x)) y=world.height(x);
    world.add(new HEAPExplosion({
      x: x,
      y: y
    }));
    var x=_.x-$.R(18,30); var y=_.y+$.R(-20,20);
    if(y>world.height(x)) y=world.height(x);
    world.add(new HEAPExplosion({
      x: x,
      y: y
    }));
    
    _.img.w=15;
    _.range=0;
    _.corpsetime=0;
  },
  
  alive:function(){ var _=this._;
    _.rangeTravelled++;
    if(!_.range) {
      this.explode();
      return _.corpsetime=0;
    }
    
    // Smoke trail
    if(_.rangeTravelled<6)
      world.add(new SmokeCloud({
        x: _.x-_.dx,
        y: _.y-_.dy
      }));
    
    // Hit enemy.
    var h=world._.xHash.getNBucketsByCoord(_.x,0);    
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      if(unit._.team==_.team)  continue;
      if(Behavior.Custom.isDead.call(unit))         continue;
      var dx=_.x-(unit._.x-(unit._.img.w>>1));
      var dy=_.y-(unit._.y-(unit._.img.h>>1));      
      if(dx*dx+dy*dy>81)       continue;   // Not close enough!
      this.explode();
      return false;
    }

    // Hit ground
    if(world.isOutside(this)) {
      _.x-=_.dx>>1;
      _.y=world.height(_.x>>0);
      this.explode();
      return false;      
    }      
        
    // Homing.
    if( _.rangeTravelled>_.homingDelay )
    {  // turn on homing function after delay
      if(_.target && !Behavior.Custom.isDead.call(_.target)) {
        _.dx+=_.target._.x<_.x? -_.dspeed: _.dspeed;
        _.dy+=_.target._.y<_.y? -_.dspeed: _.dspeed;
        if(_.dx*_.dx+_.dy*_.dy>_.maxSpeed) {
          _.dy*=$.R(30,50)/100; // normalize speed with feedback
          _.dx*=$.R(70,80)/100;
        }
      } else {      
        // Gravity
        _.dy+=_.ddy;
        world._.xHash.getCrowdedEnemy(this);
      }
    }
    
    // Projectile angle graphics
    // Days since last no division by zero: 10
    if(_.dx==0) _.dx=0.001;
    if(_.dy==0) _.dy=0.001;
    var dydx=Math.abs(_.dy/_.dx);
    var fr; 
    
    if(_.dx<0 && _.dy<0)      fr=[4,3,2,1,0];
    else if(_.dx<0 && _.dy>0) fr=[4,5,6,7,8];
    else if(_.dx>0 && _.dy>0) fr=[12,11,10,9,8];
    else                      fr=[12,13,14,15,0];
    
    _.img.frame=fr[0];
    if(dydx>=0.1989 && dydx<0.6681)  _.img.frame=fr[1];
    if(dydx>=0.6681 && dydx<1.4966)  _.img.frame=fr[2];
    if(dydx>=1.4966 && dydx<5.0273)  _.img.frame=fr[3];
    if(dydx>=5.0273)                 _.img.frame=fr[4];
    
    _.y+=_.dy;
    _.x+=_.dx;    
    
    _.range--;
    return false;
  }
});

HomingMissileSmall = HomingMissile.extend({
  init:function(params){
    this._=$.extend({
      img:            { w:10, h:10, frame:0, sheet:preloader.getFile('missileorange') },
      maxSpeed:       130,
      range:          30,
      rangeTravelled: 0,
      ddy:            0.081,
      dspeed:         0.24,
      homingDelay:    8,
      sight:          4,
      target:         undefined
    },params);
    this._super(this._);
  },
  explode:function(){ var _=this._;
    world.add(new SmallExplosion({
      x: _.x,
      y: _.y
    }));
    //_.img.w=15;
    _.range=0;
    _.corpsetime=0;
  }
  
});