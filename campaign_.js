// strategic view //////////////////////////////////////////////////////////////

var Campaign=new function () {
/* campaign map has elements:
  cities - civilian centers, funding, research
  factories -  heavy / special weapon production site
  bases - contain supplies for your operations, adjacent bases to mission will
          determine what you can use in the mission, all cities and factories
          are bases by default.
  
  
  
  
*/
  this.map;
  
  this.research
  
  this.City=function(x,y,team){
    this.x=x;
    this.y=y;
    this.team=team;
    this.funding=10;
    this.research=10;
  };
  
  this.makeMap=function(){
    //gffdggdd
  };
  
};

var MapTile={
  Heights:{
    Mountain:4,
    Hill:2,
    Plain:0,
    Valley:-2
  },
  Locations:{
    
    CityBlock:{},   // can be turned into any team location except missile pad
    Village:{},     // can only be turned into a forward base
    
    // Team specific locations
    
    Supply:{},      // mass-storage of resources, personnel
    Forward:{},     // small-storage of units, light artillery
    Production:{},  // vehicle creation and repair
    AirPort:{},     // aircraft and suborbital craft production / maintenance
    
    MissilePad:{},  // long range superweapon
    Fortress:{}     // leadership stronghold
  },
};

var Resources={
  // your supply of usable troops is limited by your supply of small arms
  SmallArms:{},
  
  Fabricon:{},    // materials to create / repair new structures,
                  // 1 x Fabricon = 20 x Producium
  Producium:{},   // materials to create new vehicles and non-structures
  
  Combatant:{},   // 
  Fanatics:{},    // 
  Engineer:{},    // retool factories, install upgrades, used to construct
  FieldAgent:{}   // report on enemy positions / productions / attack plans      
};