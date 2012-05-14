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

Commander = Pawn.extend({
  init:function(params){
    this._=$.extend({
      //img:    {}, // no icon for now
      behavior: { alive:Behavior.Library.CommanderIdle, dead:undefined },
      strength: $.R(1,60),  // limit on # squads they can manage simultaneously
      squads:   [],
      comm:     [],   // Comm(ander) relays = stations that broadcast orders
      repair:   [],   // repair facilities
      depot:    []    // caches of resources, abstract or real
    },params);
  },
  alive:function(){ Behavior.Execute(this._.behavior.alive,this); return true; }
});


Squad = Pawn.extend({
  init:function(params){
    this._=$.extend({
      //img:            {}, // no icon for now
      behavior:         { alive:Behavior.Library.SquadAttack, dead:undefined },
      members:          [],
      minX:             Infinity,
      allMembersJoined: false
    },params);
  },
  alive:function(){ Behavior.Execute(this._.behavior.alive,this); return true; }
});