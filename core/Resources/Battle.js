// Resources that double as active Pawns in a Battle.
define({
   
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