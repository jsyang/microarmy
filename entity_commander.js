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
  this.comm=[];
  this.repairFacility=[];
  
  
  // 0-100 % rating of the high-level strength of the team in the current battle
  this.strength=100;
  
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

--------------------------------------------------------------------------------

more weapons types -- more gameplay variety -- like mines (but not specifically
touch traps)

-- in this vein -- inherently emergent gameplay elements -----------------------

RETURN-TO-SENDER mechanic (homing radar jammer)
unit that has this property that is targeted by a homingmissile has a chance of
jamming the homing function and redirecting the missile to attack units friendly
to owner

physical wall structure prevents enemy units from penetrating beyond the limits
of the cordoned areas

-------------------------------------------------------------------------------

for campaign view, column units move with flock AI? such level of complexity is
probably not necessary

weapons cache locations -- able to supply/upgrade units with resources from these
locations if the location is captured intact

-------------------------------------------------------------------------------

lower class systems are zero-sum, so they effectively bootstrap to survive
higher class systems are not (like printers of fiat currency), and thus benefit
from the side effects of lower classes' bootstrapping

-------------------------------------------------------------------------------

make game music video for microarmy to mr. sandman
time "bum"s to various things exploding

deformable terrain? if terrain below a large structure is deformed to much,
structure collapses



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