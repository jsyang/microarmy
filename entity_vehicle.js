var VEHICLE={
  ACTION:{
    IDLING:-1,
    MOVING:0,
    TURNING:1,
    WRECK:2,
    MAX:4
  }
};


////////////////////////////////////////////////////////////////////////////////

Vehicle.prototype=new Pawn;
function Vehicle() {

  this.corpsetime=240;
  this.takeDamage=function(d){ return this._.health-=d; };
  this.isDead=function(){ return this._.health<=0; };
  
  this.remove=function(){ // silently remove the Pawn.
    this.corpsetime=this._.health=0;
    this._.action=VEHICLE.ACTION.WRECK;
    this._.frame.current=0;
  };
  
  // Rotation gfx
  this.getGFX=function(){ var _=this._;
    return {
      img:    this.img.sheet,
      imgdx:  _.direction>0? this.img.w:0,
      imgdy:
        _.action==VEHICLE.ACTION.WRECK?
          6*this.img.h
          :_.action==VEHICLE.ACTION.TURNING?
            (_.frame.current+3)*this.img.h
            :_.frame.current*this.img.h,
      worldx: this.x-(this.img.w>>1),
      worldy: this.y-this.img.h+1,
      imgw:this.img.w, imgh:this.img.h
    }
  };

  this.alive=function(){ var _=this._;
    if(Behavior.Custom.isDead(this)) {
      if(_.action<VEHICLE.ACTION.WRECK) {
        _.action=VEHICLE.ACTION.WRECK;
        //soundManager.play('die1,die2,die3,die4'.split(',')[$.R(0,3)]);        
      }
      return false;
    } else {
      Behavior.Execute(this.behavior,this);
      return true;
    }
  };  
}

////////////////////////////////////////////////////////////////////////////////


// The APC will be the first Pawn to have behavior tree AI
APC.prototype=new Vehicle;
function APC(x,y,team) {
  this.x=x;
  this.y=y;
  this.team=team;
  this.img={
    w:21, h:11, hDist2: 81, sheet: preloader.getFile('apc'+TEAM.NAMES[team])
  };

  this._={
    action:     VEHICLE.ACTION.MOVING,
    frame:      { current:0, first:0, last:2 },
    target:     undefined,
    direction:  TEAM.GOALDIRECTION[team],
    
    projectile: MGBullet,
    turn:       { ing:0, current:0, last: 2 },
    sight:      7,
    health:     $.R(560,720),
    reload:     { ing:0, time:40 },
    ammo:       { clip:6, max:6 }
  };
  
  this.behavior={id:"selector",children:[
  {id:"isReloading"},
  {id:"sequence",children:[{id:"foundTarget"},{id:"selector",children:[
    {id:"sequence",children:[{id:"!isFacingTarget"},{id:"loopAnimation"}]},
    {id:"sequence",children:[{id:"seeTarget"},{id:"attack"}]}
  ]}]},
  {id:"sequence",children:[{id:"movePawn"},{id:"loopAnimation"},{id:"sequence",children:[
    {id:"isOutsideWorld"},
    {id:"walkingOffMapCheck"}
  ]}]}
]};
}