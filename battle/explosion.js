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

    // add some fires..
    for(var i=$.R(0,4); i-->0;) {
      var x=this._.x-$.R(48,64)+$.R(48,64);
      var y=world.height(x);
      world.add(new Flame({ x: x, y: y }));
    }
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

FlakExplosion = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last:6 },
      img:          { w:24, h:17, hDist2: 260, sheet: preloader.getFile('exp0') },
      damage:       $.R(11,47),
      damageDecay:  3
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

// Releases ChemClouds when done exploding.

ChemExplosion = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last:3 },
      img:          { w:20, h:20, hDist2: 360, sheet: preloader.getFile('chemexp') },
      damage:       $.R(11,18),
      damageDecay:  1
    },params);
    this._super(this._);
    soundManager.play('chemspray');
  },
  
  dead: function(){ var _=this._;
    for(var i=$.R(1,2); i--;){
      world.add(new ChemCloud({ x:_.x, y:_.y }));
    }
  },
  
  alive:function(){ var _=this._;
    if(_.frame.current==_.frame.last) {
      this.dead();
      return _.corpsetime=0;
    }
    _.frame.current++;
    
    // Explosion forces gas around
    _.y-=$.R(1,4);	  
    _.x+=$.r()-$.r();
    
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
// Special effects

SmokeCloud = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last:6 },
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

SmokeCloudSmall = SmokeCloud.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last:3 },
      img:          { w:8, h:13, sheet: preloader.getFile('smokesmall') },
      damageDecay:  1
    },params);
    this._super(this._);
  }
});

Flame = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:$.R(0,4), last:4 },
      img:          { w:6, h:4, sheet: preloader.getFile('firesmall'+$.R(0,2)) },
      cycles:       $.R(2,20)
    },params);

	if($.R(0,40)<4) {
        this._=$.extend(this._, {
		    img: 	{ w:10, h:11, sheet: preloader.getFile('firemedium0') },
            frame:	{ current:$.R(0,64), last:64 },
			cycles: $.R(1,4)
		});
	} else if($.R(0,40)<7) {
		this._=$.extend(this._, {
		    img: 	{ w:23, h:23, sheet: preloader.getFile('firemedium1') },
            frame:	{ current:$.R(0,14), last:14 },
			cycles: $.R(2,11)
		});
	}
	
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

ChemCloud = Explosion.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:$.R(0,2) },
      img:          { w:20, h:20, hDist2: 400, sheet: preloader.getFile('chemcloud') },
      damage:       4,
      damageDecay:  0,
      cycles:       $.R(100,120),
      driftdx:		$.R(0,1)
    },params);
	
    this._super(this._);
  },
  
  drift:function() { var _=this._;
    // ChemCloud drifts around
    _.x+=_.driftdx>0? $.r() : -$.r();
    
    var cloudBottom = _.y+(_.img.h>>1);
    if(cloudBottom < world.height(_.x) ) {
	  _.y+=$.R(0,1);
    } else {
	  _.y = world.height(_.x) - (_.img.h>>1);
      // Gas drifts downhill mostly.
      _.driftdx = -_.driftdx;
    }
  },
  
  poison:function() { var _=this._;
    var h=world._.xHash.getNBucketsByCoord(_.x,2);
    for(var i=0; i<h.length; i++) {
      var unit=h[i];
      if(unit instanceof Infantry) {
        var dx=_.x-(unit._.x-(unit._.img.w>>1));     // point object.
        var dy=_.y-(unit._.y-(unit._.img.h>>1));      
        if(dx*dx+dy*dy>_.img.hDist2) continue;   // Not close enough!
        Behavior.Custom.takeDamage.call(unit,_.damage);
      } else {
        // todo: Damage production for depots and production centers.        
      }      
    }    
  },
  
  alive:function(){ var _=this._;

    _.cycles--;
    if(_.cycles==0) return _.corpsetime=0;
    _.frame.current = $.R(0,2);
    
    this.drift();
    this.poison();
    
    return false;
  }
});


////////////////////////////////////////////////////////////////////////////////
// Testing sprites

BlueHelicopter = SmokeCloud.extend({
  init:function(params){
    this._=$.extend({
      frame:        { current:-1, last: 1}, //last:2 }, // slower animation
      img:          { w:36, h:15, sheet: preloader.getFile('heli0') },
    },params);
	this._.corpsetime = Infinity;
  },
  gfx:function(){ var _=this._;
    return {
      img:    _.img.sheet,
      imgdx:  0,
      imgdy:  _.frame.current*_.img.h,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:_.img.w,
      imgh:_.img.h
    }
  },
  alive:function(){ var _=this._;
    if(_.frame.current==_.frame.last) _.frame.current = -1;
    _.frame.current++;
	
	if(_.y < world.height(_.x) ) {
	  _.y+=$.R(0,1);
	  _.x+=$.R(0,1);
	}
	
    return false;
  }
});
