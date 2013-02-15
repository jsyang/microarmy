/* Resource format example.

  'resource name' : {
    battle : {                      // (if exists) can this resource influence battles?
      pawn : 'PawnEntity'           // what does 1 such resource correspond to in a Battle?
    },
   
    tech : 3,                       // tech level of the resource. players at a tech level know that all resources
                                    // at that tech level exist. (still need to research them)
                                    
    synth : {                       // can be synthesized / decomposed
      rate : 2,                     // how many are made per turn for 1 synthesizer
      needs : {                     // requirements to make one such resource
        resource1 : qty,
        resource2 : qty
      },
      bonus : {                     // what will increase our rate of synthesis if we have some
        resource1
      }
    },
                     
    keep : {                        // (if exists) what does keeping one of these resource units require?
                                    // if we don't have the requirements to keep, it may be lost!
      needs : {
        resource1 : qty,
        resource2 : qty
      }
    }
  }
   
*/