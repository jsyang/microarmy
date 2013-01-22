
/*
 It's been decided that the campaign map world will be square tiles.
 Each tile will have its own attributes for how players can interact
 with it.
 See notepad for more.

*/

var dsdfsddfCampaign=new function () {
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



//////////////////// ^ old stuff /////////////////////////////////////////////////////////////////////
// Resources notes

  /*

  each resource has its own harvester and synthesizer
  synthesizer (entity which processes ingredients and tries to synthesize another resource)

  for instance a production base will have a small arms factory
  small arms factory synthesizes small arms parts    from metal, minerals
                     synthesizes small arms ammo     from explosives, small arms parts
                     synthesizes small arms          from small arms parts

  crops synthesizes food from nutrients

  world (natural processes) synthesizes nutrients from atoms


  atomizer can turn non-atom resources back into atoms
  universal constructor can use those atoms to build whatever you have researched to build
     bypassing hierarchical resource requirements

  certain synthesizers have bonuses for producing certain things, otherwise they use the default
  synthesis rate

  map tiles have a certain number of atoms (the height, ex: 14 --> 14e6 atoms)
  and also a certain number of pre-existing resource amounts

  forest tile --> 32 nutrients
                  6 metal
                  18 food

  a synthesizing entity can have multiple synthesis processes going on at once

  determine the atomic value of each non-elementary resource by
  recursing through the needs tree until you get to an elementary resource

  mining a piece of terrain (harvesting using a harvester entity) will yield resources
  farming (harvesting)

  harvesting is basically a high level synthesis, so in actuality you're doing the same thing

  if a high level synthesis fails the synthesis chance roll, there is a chance the ingredients
  will either be lost or turned into rubble

  rubble fills up resource stores eventually and must be cleared (maybe automatically)

  */


  


