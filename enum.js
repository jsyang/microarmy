// Enums and other constants ///////////////////////////////////////////////////
var Enum=
{
  Team:
  {
    BLUE: 0,
    GREEN: 1
  },
  
  // Probably shouldn't go here, but it is hardcoded for now.
  // Corresponds to the the team color (default travel direction -- when there's no targets in sight!)
  Directions:
  [
    1,
    -1
  ],
  
  
  // or get attack direction via Math.pow(-1,Enum.Team[actualTeam]);
  
  TeamGoal:
  {
    ATTACK:0,
    DEFEND:1,
    RETREAT:2,
    MANUFACTURE:3,
    FORTIFY:4,
  },
  
  UnitClass:
  {
    INFANTRY:0,
    VEHICLES:1,
    AIRCRAFT:2,
            
    PILLBOX:3,      // includes sandbag fortifications
    PROPSTRUCT:4    // struct doesn't shoot.
  },
  
  InfantryAction:
  {
    MOVEMENT:0,
    ATTACK_STANDING:1,
    ATTACK_CROUCHING:2,
    ATTACK_PRONE:3,
    DEATH1:4,
    DEATH2:5
  },
  
  ProjectileTypes:
  {
    BULLET:0,
    SMALLROCKET:1,
    SMALLSHELL:2,
    HEAVYSHELL:3,
    HEAVYROCKET:4,
    NAPALMBOMBLET:5,
    TACTICALNUKE:6
  },
  
  // This is linked to the loading order of the FG resources in LoadResources().
  GFX:
  {    
    PROJECTILES:0,
    EXPLOSION1:1,
    
    // Enum.Team:
    //          BLUE  GREEN
    PISTOL:[    2,    4],
    ROCKET:[    3,    5],
    
    COMMCENTER:[6,    7],
    
    // Which frames do we actually do the shooting?
    ISFIRING:
    {//       -----------|...........             
      PISTOL:[0,1,0,1,0,0,0,1,0,1,0,0],
      ROCKET:[0,0,0,1,0,0,0,0,0,1,0,0]
    },
    
    
  }
};
