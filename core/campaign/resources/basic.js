// All the basic resources / tech types available during the beginning of the game
// synth = chance of synthesis,
// some resource synthesizers are negative, if the needs aren't there, resources are LOST
// actor resources have an additional morale
define({

  nutrients : {
    atoms : 18,
    synth : 0.6
  },

  metal : {
    atoms : 5,
    synth : 0.2
  },

  combustible : {
    atoms : 11,
    synth : 0.1
  },

  rubble : {
    atoms : 2,
    synth : 0.04
  },

  alloy : {
    synth : 0.8,
    needs : {
      metal : 2
    }
  },

  fuel : {
    atoms : 30,
    synth : 0.08,
  },

  food : {
    // needed to create new infantry
    // needed to heal infantry
    synth : 0.03,
    needs : {
      nutrients : 3
    }
  },

  explosives : {
    synth : 0.3,
    needs : {
      combustible : 2,
      nutrients   : 3
    }
  },

  'high explosives' : {
    synth : 0.2,
    needs : {
      explosives : 3,
      nutrients  : 1
    }
  },

  militia : {
    // old "combatant"
    synth : 0.03,
    morale : 0.9,
    needs : {
      food      : 3,
      citizen   : 1,
      smallarms : 1
    }
  },

  citizen : {
    synth   : 0.08,
    morale  : 0.6,
    needs : {
      food    : 1,
      citizen : 2
    }
  },

  'small arms' : {
    synth   : 0.1,
    needs : {
      alloy       : 2,
      explosives  : 1
    }
  },

  'small rockets' : {
    synth   : 0.08,
    needs : {
      alloy       : 1,
      explosives  : 2,
      combustible : 1
    }
  },

  

});

/*
Each resources worth in terms of atoms
and chance of synthesis, given all the ingredients
non-physical resources have a 0 atom count
*/
