var STRUCTURE={
  STATE:{
    GOOD:0,
    BAD:1,
    WRECK:2
  }
};

// Structure classes ///////////////////////////////////////////////////////////
Structure.prototype=new Pawn;
function Structure() {
  this.state=STRUCTURE.STATE.GOOD;
  this.corpsetime=Infinity;
  
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  (this._.direction>0)? this.img.w:0,
      imgdy:  this.state*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  }
  
  this.alive=function() { var _=this._;    
    if(Behavior.Custom.isDead(this)) {
      if(this.state!=STRUCTURE.STATE.WRECK) {
        this.state=STRUCTURE.STATE.WRECK;
        soundManager.play('crumble');
        Behavior.Custom.throwShrapnel(this);
      }
      return false;
    } else {
      Behavior.Execute(_.behavior,this);
      
      // shouldn't be able to target an unoccupied building
      if(_.crew && !_.crew.current) {
        this.imgSheet=_.crew.empty;
        return false;
      }
      return true;
    }    
  };
}

////////////////////////////////////////////////////////////////////////////////

CommCenter.prototype=new Structure;
function CommCenter(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.state=STRUCTURE.STATE.GOOD;
  
  this.img={ w:28, h:28, hDist2:196 };
  this.imgSheet=preloader.getFile('comm'+TEAM.NAMES[team]);  

  // Panic attack: launch homing missile from hell.
  
  this._={
    sight:        16,
    ammo:         { clip: 1, max:1 },
    reload:       { ing:0, time:$.R(20,1220), min:20, max: 1220 },
    projectile:   undefined,
    
    behavior:     Behavior.Library.Structure,
    
    health:       { current:$.R(2100,2500), max:$.R(2500,2600) },
    direction:    TEAM.GOALDIRECTION[team],
    reinforce:    { next: 0, time: 290,
                    types:  [PistolInfantry,RocketInfantry],
                    supply: [320,180],                    
                    chances:[0.7,0.27],
                    
                    // big dmg kills reinforcements
                    damageThreshold:  18,
                    damageChance:     0.4
                  },
    
    target:       undefined
  };
}

Barracks.prototype=new Structure;
function Barracks(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:32, h:12, hDist2:169 };
  this.imgSheet=preloader.getFile('barracks'+TEAM.NAMES[team]);  
    
  this._={    
    health:       { current:$.R(1800,1950), max:$.R(1950,2500) },
    direction:    TEAM.GOALDIRECTION[team],
    behavior:     Behavior.Library.Structure,
    
    reinforce:    { next: 0, time: 280,
                    types:  [PistolInfantry],
                    supply: [250],
                    chances:[1],
                    
                    // big dmg kills reinforcements
                    damageThreshold:  24,
                    damageChance:     0.6
                  },
    
    target:       undefined
  };
}

Scaffold.prototype=new Structure;
function Scaffold(x,y,team) {
  soundManager.play('tack');
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:16, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('scaffold_');
  
  this._={
    behavior:     Behavior.Library.Scaffold,
    health:       { current:$.R(360,400), max:$.R(400,450) },
    direction:    TEAM.GOALDIRECTION[team],
    build:        {type:undefined},
    crew:         { current: 1, max:2,
                    occupied: function(o){
                      return preloader.getFile('scaffold'+TEAM.NAMES[o.team]);
                    },
                    empty: preloader.getFile('scaffold_'),
                    
                    damageThreshold:  5,
                    damageChance:     1
                  },

    target:       undefined
  }
}

Depot.prototype=new Structure;
function Depot(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('depot');
  
}

RepairYard.prototype=new Structure;
function RepairYard(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('repair');  
  
}

Helipad.prototype=new Structure;
function Helipad(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('helipad');
}


// Defensive structures ////////////////////////////////////////////////////////

Pillbox.prototype=new Structure;
function Pillbox(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:19, h:8, hDist2:64 };
  this.imgSheet=preloader.getFile('pillbox_');
  
  this._={
    behavior:     Behavior.Library.Pillbox,
    sight:        3,
    health:       { current:$.R(800,900), max:$.R(800,1100) },
    projectile:   MGBullet,
    direction:    TEAM.GOALDIRECTION[team],
    reload:       { ing:0, time: 50 },
    ammo:         { clip:6, max: 6 },
    shootHeight:  5,
    crew:         { current: 0, max:8,
                    occupied: function(o){
                      return preloader.getFile('pillbox'+TEAM.NAMES[o.team]);
                    },
                    empty: preloader.getFile('pillbox_'),
                    damageThreshold:  23,
                    damageChance:     0.25
                  },

    target:       undefined
  }
}

SmallTurret.prototype=new Structure;
function SmallTurret(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  
  this.img={ w:22, h:9, hDist2:90 };
  this.imgSheet=preloader.getFile('turret'+TEAM.NAMES[team]);
  
  // Rotation gfx
  this.getGFX=function(){
    return {
      img:    this.imgSheet,
      imgdx:  (this._.direction>0)? this.img.w:0,
      imgdy:
        this.state!=STRUCTURE.STATE.WRECK?
          this.state*45+this.img.h*this._.turn.current
          :90,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  };
  
  this._={
    behavior:         Behavior.Library.SmallTurret,
    sight:            5,
    health:           { current:$.R(1900,2100), max:$.R(2100,2300) },
    projectile:       SmallShell,
    projectileSpeed:  7,
    direction:        TEAM.GOALDIRECTION[team],
    reload:           { ing:0, time: 90 },
    ammo:             { clip:1, max: 1 },
    shootHeight:      6,
    turn:             { ing: 0, current:0, last:4 },    
    
    target:       undefined
  }   
}