// Intelligence Controlling a Team
var COMMANDER={
  GOAL:{
    IDLE:0,
    BUILD:1,
    ATTACK:2,
    DEFEND:3,
    ESCORT:4,
    REPAIR:5,
    EVACUATE:6
  }
}

////////////////////////////////////////////////////////////////////////////////

Commander.prototype=new PawnController;
function Commander(team) {
  // No icon for now.
  // this.getGFX=function(){};
  
  this.alive=function() {
    
    // Build stuff, issue orders
    return false;
  };

  this._={
    goal:       COMMANDER.GOAL.IDLE,
    strength:   $.R(3,20),  // limit on # squads they can manage simultaneously
  
    resource: { Infantry: 0,
                Vehicle:  0,
                Structure:0 },
    
    squads: [],   // length should be no more than (strength, as above)
    
    comm:   [],   // Comm(ander) relays = stations that broadcast orders
    repair: [],   // repair facilities
    depot:  []    // caches of resources, abstract or real
  };
 
}

Squad.prototype=new PawnController;
function Squad(team) {
  this.members=[];
  // this.getGFX=function(){ return; };
  
  this.alive=function(){
    Behavior.Execute(this._.behavior,this);
    return false;
  }
  
  this._={
    behavior: undefined
  };
}