// Base Entities ///////////////////////////////////////////////////////////////

function Pawn(x,y,team,target)
//  team    (ENUM) alliegance
//  target  (*) pointer to a goal: an enemy, usually
{    
  this.x=x;
  this.y=y;    
  this.team=team;
  this.target=target;
    
  // Animation
  this.frame=0;
  this.firstFrame=0;
  this.lastFrame=0;
}

function TeamInfo(x,y,team)
//  Holds the Team's reinforcements and resource info.
//  team    (ENUM) alliegance
{
  this.funds=500;
  this.fundRate=20;
  this.fundTime=50;
  
  this.reinforcementQueue=[];
  this.reinforcementTime=10;
  
  this.goal=Enum.TeamGoal.ATTACK;
}
