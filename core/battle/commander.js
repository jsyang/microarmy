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
PawnController = Pawn.extend({
  init: function(){},
  alive:function(){},
  gfx:  function(){}
})


Commander = PawnController.extend({
  init:function(params){
    this._=$.extend({
      //img:    {}, // no icon for now
      behavior: { alive:Behavior.Library.CommanderIdle, dead:undefined },
      strength: $.R(1,60),  // limit on # squads they can manage simultaneously
      attention:[],         // [minX, maxX] range of where the hotspot is
      urgency:  0,          // how bad is this area?
      
      squads:   [],
      comm:     [],         // Comm(ander) relays = stations that broadcast orders
      repair:   [],         // repair facilities
      depot:    []          // caches of resources, abstract or real
    },params);
  },
  alive:function(){ Behavior.Execute(this._.behavior.alive,this); return true; }
});


Squad = PawnController.extend({
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