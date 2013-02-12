// All the basic resources / tech types available during the beginning of the game
// synth = chance of synthesis,
// some resource synthesizers are negative, if the needs aren't there, resources are LOST
// actor resources have an additional morale
define({
   
  /*
   resource name : {
    battle : {      // can this resource influence battles?
      pawn : 
    },
    
    tech : 3,    // at what tech level can we identify this resource so that we can research it / whatever
    //atoms : 0       // when decomposed by atomizer, atomizer yields # of atoms based on techLevel.
                      // atoms count is scrapped.
    synth : {         // can be synthesized / decomposed
      rate,           // how many get made per turn...
      needs : {
        resource1 : qty,
        resource2 : qty
      },
      bonus : {
        resource1
      }
    },
                      // if keep is undefined, resource is not perishable.
                      
    keep : {          // keeping one of these requires the following resources, if not satisfied, there is a 50% chance
                      // of losing the units for which we don't have the needs to upkeep
      needs : {
        resource1 : qty,
        resource2 : qty
      }
    }
    
   }
   
  */
  
  nutrient    : { tech : 0 },
  metal       : { tech : 0 },
  combustible : { tech : 0 },
  concrete    : { tech : 0 },
  rubble      : { tech : 0 },
  fuel        : { tech : 0 },
  
  alloy : {
    tech : 1,
    synth : {
      rate : 0.8,
      needs : { metal : 2 }
    }
  },
  
  food : {
    tech : 0,
    synth : {
      rate : 1.3,
      needs : { nutrient : 2 }
    }
  },
  
  explosive : {
    tech : 1,
    synth : {
      rate : 0.09,
      needs : {
        nutrient : 3,
        combustible : 2
      }
    }
  },
  
  'town square' : {
    tech : 1,
    synth : {
      rate : 0.003,
      needs : {
        citizen : 1,
        metal : 2,
        concrete : 1
      }
    },
    keep : {
      needs : {
        fuel : 10
      }
    }
  },
  
  'high explosive' : {
    tech : 3,
    synth : {
      rate : 0.04,
      needs : {
        nutrient : 3,
        rubble : 1,
        explosive : 3
      }
    }
  },
  
  
  'small arm' : {
    tech : 2,
    synth : {
      rate : 1,
      needs : {
        metal : 1,
        alloy : 2,
        explosive : 1
      }
    }
  },
  
  'small rocket launcher' : {
    tech : 5,
    synth : {
      rate : 1,
      needs : {
        alloy : 5,
        explosive : 2,
        fuel : 1,
        'high explosive' : 4,
        combustible : 1
      }
    }
  },
  
  'engineering kit' : {
    tech : 3,
    synth : {
      rate : 1,
      needs : {
        'small arm' : 4,
        alloy : 10,
        combustible : 4,
        metal : 3
      }
    }
  },
  
  citizen : {
    tech : 2,
    synth : {
      rate : 2,
      needs : {
        citizen : 1,  // yes. mitosis.
        food : 6
      }
    },
    keep : {
      needs : {
        food : 1
      }
    }
  },
  
  'advanced alloy' : {
    tech : 7,
    synth : {
      rate : 0.4,
      needs : {
        alloy : 10,
        nutrient : 2
      }
    }
  },
  
  'reactive vehicle armor' : {
    tech : 9,
    synth : {
      rate : 1,
      needs : {
        'advanced alloy' : 2,
        'explosives'     : 1
      }
    }
  }, 
  

  // battle resources ////////////////////////////////////////////////////////////////////////////////////////////////
  
  'pistol infantry' : {
    battle : { pawn : 'PistolInfantry' },
    tech : 2,
    synth : {
      rate : 1,
      needs : {
        citizen : 1,
        'small arm' : 1,
        food : 2
      }
    },
    keep : {
      needs : {
        food : 1,
        'small arm' : 1
      }
    }
  },
  
  'rocket infantry' : {
    battle : { pawn : 'RocketInfantry' },
    tech : 4,
    synth : {
      rate : 1,
      needs : {
        'pistol infantry' : 1,
        'small rocket launcher' : 1,
        food : 5
      }
    },
    keep : {
      needs : {
        food : 1,
        'small rocket launcher' : 1
      }
    }
  },
  
  'engineer infantry' : {
    battle : { pawn : 'EngineerInfantry' },
    tech : 3,
    synth : {
      rate : 1,
      needs : {
        citizen : 1,
        'engineering kit' : 1,
        food : 50
      }
    },
    keep : {
      needs : {
        food : 2,
        metal : 2
      }
    }
  }

});