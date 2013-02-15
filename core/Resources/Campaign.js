// Campaign Resources --
define({

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
  }

});