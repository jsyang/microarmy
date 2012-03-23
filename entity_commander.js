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
/*
  GOAL states -- each of these should be a behavior tree, rather than an 
  enum'd list of states.

  IDLE, BUILD, ATTACK, DEFEND, ESCORT, REPAIR, EVACUATE

*/


Commander.prototype=new PawnController;
function Commander(team) {
  // No icon for now.
  // this.getGFX=function(){};
  
  this.alive=function() {
    Behavior.Execute(this._.behavior,this);
    // Build stuff, issue orders
    return false;
  };

  this._={
    behavior:   undefined,
    goal:       COMMANDER.GOAL.IDLE,
    strength:   $.R(3,20),  // limit on # squads they can manage simultaneously

    squads: [],   // length should be no more than (strength, as above)
    
    comm:   [],   // Comm(ander) relays = stations that broadcast orders
    repair: [],   // repair facilities
    depot:  []    // caches of resources, abstract or real
  };
 
}

Squad.prototype=new PawnController;
function Squad(team) {
  // this.getGFX=function(){ return; };
  
  this.alive=function(){
    Behavior.Execute(this._.behavior,this);
    return false;
  }
  
  this._={
    behavior: undefined,
    members:  []
  };
}