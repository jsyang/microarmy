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
  this.team=team;
  // No icon for now.
  // this.getGFX=function(){};
  
  this.alive=function() {
    Behavior.Execute(this._.behavior,this);
    return true;
  };

  this._={
    behavior:   Behavior.Library.CommanderIdle,
    strength:   $.R(2,20),  // limit on # squads they can manage simultaneously

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
    return Behavior.Execute(this._.behavior,this);
  }
  
  this._={
    behavior:         Behavior.Library.SquadAttack,
    allMembersJoined: false,
    members:          []
  };
}