# Resources only for Campaign
define
  
  # Food related # # # # # # # #   
  'food':
    techLevel: 0
    synth:
      rate: 10
  
  agriculture: # "farmer"
    techLevel: 0
    make:
      food: 1   # production rate bonus. 2 x production rate with same requirements
    
  'advanced agriculture':
    techLevel: 1
    make:
      food: 4
  
  # Metal related # # # # # # # #
  'metal':
    techLevel: 0
  
  'alloy':
    techLevel: 1
    synth:
      rate: 1
      needs:
        metal: 1

  'advanced alloy':
    techLevel: 5
    synth:
      rate: 2
      needs:
        alloy: 3
        nutrient: 1
        fuel: 1
        
  "space alloy":
    techLevel: 9
    synth:
      rate: 1
      needs:
        'advanced alloy': 4
        nutrient: 4
        fuel: 4

  # Combustible related # # # # # # # #
  'combustible':
    techLevel : 0
    
    
  'concrete'    : techLevel : 0
  'rubble'      : techLevel : 0
  'fuel'        : techLevel : 0
    
  
  

  explosive:
    techLevel: 1
    synth:
      rate: 0.09
      needs:
        nutrient: 3
        combustible: 2

  
        
  "town square":
    techLevel: 1
    synth:
      rate: 0.003
      needs:
        citizen: 1
        metal: 2
        concrete: 1
    keep:
      needs:
        fuel: 10

  "high explosive":
    techLevel: 3
    synth:
      rate: 0.04
      needs:
        nutrient: 3
        rubble: 1
        explosive: 3

  "small arm":
    techLevel: 2
    synth:
      rate: 1
      needs:
        metal: 1
        alloy: 2
        explosive: 1

  "small rocket launcher":
    techLevel: 5
    synth:
      rate: 1
      needs:
        alloy: 5
        explosive: 2
        fuel: 1
        "high explosive": 4
        combustible: 1

  "engineering kit":
    techLevel: 3
    synth:
      rate: 1
      needs:
        "small arm": 4
        alloy: 10
        combustible: 4
        metal: 3

  citizen:
    techLevel: 2
    synth:
      rate: 2
      needs:
        citizen: 1 # yes. mitosis.
        food: 6
    keep:
      needs:
        food: 1
    make:
      food: true
      citizen: true

