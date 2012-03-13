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
  },
  
  SQUADTEMPLATE:{
    DEFENSIVE1:[
      PistolInfantry,
      PistolInfantry,
      PistolInfantry,
      PistolInfantry,
      PistolInfantry
    ],
    DEFENSIVE2:[
      RocketInfantry,
      RocketInfantry,
      PistolInfantry,
      PistolInfantry,
      PistolInfantry
    ],
    
    OFFENSIVE1:[
      RocketInfantry,
      RocketInfantry,
      RocketInfantry,
      RocketInfantry,
      PistolInfantry
    ]
  }
}

Commander.prototype=new Pawn;
function Commander(team) {

  this.alive=function() {
    
    // Build stuff, issue orders
    return false;
  };

  this._={
    goal:       COMMANDER.GOAL.IDLE,
    strength:   $.R(3,20),  // limit on # squads they can manage simultaneously
    
    comm:   [],   // Comm(ander) relays = stations that broadcast orders
    repair: [],   // repair facilities
    depot:  []    // caches of resources, abstract or real
  };
 
}


/*  Squads are created by the Team's commander entity for accomplishing various
    tasks in the battleview, a squad is made of >=8 PistolInfantry points
    
    abstract entities, you cannot target the idea of a SQUAD, but you can target
    its individual members

Unit                PistolInfantry points

PistolInfantry      1
RocketInfantry      2
EngineerInfantry    4

APC                 4
MedTank             4

SpecialAttackCar    5

each squad "strength" is evaluated via these points. used to target the most
valuable targets in the battlefield

once a squad is worth less than 8 points it is disbanded; all squad members
act independently with their own AI, not the squad version of the AI

individual (non-squad) AI has only simplistic behavior trees
squad based AI has more high level goals (like defend, which individual AI
should not have, individual should just fight to the death or retreat, but
not plan a defense more strategicly than a SQUAD)

commander's # of simultaneously controlled squads should be proportion to its
"skill" level. this problem can be mitigated by committing more commanders into
the battle.

each commander should tied to a comm___ structure, when destroyed, the
corresponding commander should be removed / die (maybe a chance of dying).

*/

Squad.prototype=new Pawn;
function Squad(team) {
  this.members=[];
  this.getGFX=function(){ return; };
  
  this.alive=function(){
    Behavior.Execute(this._.behavior,x);
    return false;
  }
  
  this._={
    
  };
}