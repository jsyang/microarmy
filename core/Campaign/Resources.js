// Storage "trait" for facilities / massive units
define([
  'core/util/Class',
  'core/util/$'
],function(Class, $){
  // elements
  // atom is indivisible
  
  // Each resource's worth in terms of atoms
  // and chance of synthesis, given all the ingredients
  
  // todo: load this externally to define what our resources are.
  
  
  var ResourcesTree = {
        
    'nutrients' : {
      atoms : 18,
      synth : 0.6
    },
    
    'metal' : {
      atoms : 5,
      synth : 0.2
    },
    
    'combustible' : {
      atoms : 11,
      synth : 0.1
    },
    
    'rubble' : {
      atoms : 2,
      synth : 1
    },
    
    
    // depends on metal tree:
    'alloy' : {
      synth : 0.8,
      needs : {
        'metal' : 2
      }
    },
    
    'advancedalloy' : {
      synth : 0.3,
      needs : {
        'alloy' : 4
      }
    },
    
    'food' : {
      // needed to create new infantry
      // needed to heal infantry
      synth : 0.03,
      needs : {
        'nutrients' : 3
      }
    },
    
    'explosives' : {
      synth : 0.3,
      needs : {
        'combustible' : 2,
        'nutrients'   : 3
      }
    },
    
    'combatant' : {
      synth : 0.03,
      needs : {
        'food'      : 3,
        'citizens'  : 1,
        'smallarms' : 1
      }
    }
    
  };
    
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
  var Resource = Class.extend({
    
    init : function(params) {
      this._ = $.extend({
        atoms : 0,
        requires : undefined
      }, params);
    }
  });
  
  return Resource;
});