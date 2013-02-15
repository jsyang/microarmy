# Resources

Absolutely everything in microarmy is a resource.  
The chief game resource = "people" units. (~ currency)  
Perhaps, additional fiat currencies may become available via "shadowy foreign board" story branch.

### A resource has manipulators
Things that act on instances of a specific resource type.  
__Synthesizers__, daughter resources which process ingredients and try to synthesize units of the
parent resource. Synthesizers may work at double their rate if bonus conditions are met.

    A production base has a 'small arms factory' resource
    small arms factory  synthesizes     small arms parts    from metal, alloys
                        synthesizes     small arms ammo     from explosives, small arms parts
                        synthesizes     small arms          from small arms parts

    crop                synthesizes     food                from nutrients
    
__Maintainer__, a process that may destroy a parent resource if conditions to maintain it aren't met.

### Atomizer / Universal Constructor Technology

Atomizers can break resources down into their compound atoms with a certain yield. 
Coupled with the universal constructor technology, a player can use those atoms to build
whatever is available to be built within the current tech level. This mechanic bypasses the usual
hierarchical resource requirements that are needed for a high tech level resource if you have enough
matter lying around.

### World as a resource

Map tiles have a certain number of atoms that can be harvested. The height of the tile determines how
many atoms it can be decomposed for. For ex: tile height 14 = 14e6 atoms.

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

    
    campaign map has elements:
  cities - civilian centers, funding, research
  factories -  heavy / special weapon production site
  bases - contain supplies for your operations, adjacent bases to mission will
          determine what you can use in the mission, all cities and factories
          are bases by default.
          
          
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
