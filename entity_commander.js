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

Commander.prototype=new Pawn;
function Commander(team) {
  this.goal=COMMANDER.GOAL.IDLE;
  
  // a team won't have that many structures, so we keep the list as an array
  // for now. these are only for reference locations for units to reconviene at
  this.structures=[];
  
  // 0-100 % rating of the high-level strength of the team in the current battle
  this.strength=100;
  
}