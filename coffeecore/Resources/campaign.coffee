# Resources only for Campaign
define
    
  # Food related # # # # # # # #   
  'food':
    techLevel:    0
    creationRate: 10
    
      
  
  agriculture:
    techLevel:    0
    creationRate: 1
    autoProduction:
      food: 1
    ingredients:
      citizen: 5
    
  'advanced agriculture':
    techLevel: 3
    autoProduction:
      food:     4 # production rate bonus. 4 x production rate with same requirements
      citizen:  2
    creationRate: 1
    ingredients:
      agriculture:  1
      fuel:         2
  
  # Metal related # # # # # # # #
  'metal':
    techLevel:    0
    creationRate: 5
      
  'mining facility':
    techLevel:    1
    creationRate: 1
    ingredients:
      citizen: 30
      metal:   10
      fuel:    10
    autoProduction:
      'metal':        2
      'combustible':  1
    
  'alloy':
    techLevel: 1
    creationRate: 1
    ingredients:
      metal: 1
  
  'smelting plant':
    techLevel: 1
    creationRate: 1
    ingredients:
      fuel:     20
      citizen:  10
      metal:    10
    autoProduction:
      alloy: 3

  'advanced alloy':
    techLevel: 5
    creationRate: 2
    ingredients:
      'alloy':    3
      'nutrient': 1
      'fuel':     1
        
  "space alloy":
    techLevel: 9
    creationRate: 1
    ingredients:
      'advanced alloy': 4
      'nutrient':       4
      'fuel':           4

  # Combustible related # # # # # # # #
  'combustible':
    techLevel : 0
    creationRate: 2

  'explosive':
    techLevel: 0
    creationRate: 2
    ingredients:
      combustible: 2

  'munitions factory':
    techLevel: 1
    creationRate: 1
    autoProduction:
      'explosive':          2
      'small arms':         4
      'small arms ammo':    5
    ingredients:
      metal: 40
      citizen: 20
      fuel: 10      
              
  "high explosive":
    techLevel: 3
    creationRate: 1
    ingredients:
      nutrient: 3
      rubble: 1
      explosive: 3

  # Fuel related # # # # # # # #
  'fuel':
    techLevel: 0
    creationRate: 4

  'oil well':
    techLevel: 1
    creationRate: 1
    ingredients:
      alloy:    20
      citizen:  10
    autoProduction:
      fuel: 1
  
  'heavy fuel':
    techLevel: 5
    creationRate: 2
    ingredients:
      fuel: 20
      combustible: 2
  
  'oil refinery'
    techLevel: 4
    creationRate: 1
    ingredients:
      'advanced alloy': 30
      'citizen':        10
    autoProduction:
      fuel:             10
    
  # Citizen related # # # # # # # #
  citizen:
    techLevel: 0
    creationRate: 2
    ingredients:
      citizen:  1
      food:     2
    maintain:
      food:     1

  'policeman':
    techLevel: 0
    creationRate: 1
    ingredients:
      citizen:      1
      fuel:         1
      'small arms': 1
    maintain:
      food: 2

  # Infantry # # # # # # # # 

  'pistol infantry':
    techLevel: 1
    creationRate: 1
    ingredients:
      'small arms': 1
      'citizen':    1
    maintain:
      food:               1
      'small arms ammo':  1

  'rocket infantry':
    techLevel: 2
    creationRate: 1
    ingredients:
      'small rocket launcher':  1
      'pistol infantry':        1
    maintain:
      food:             1
      'small rocket':   1

  'engineer infantry':
    techLevel: 2
    creationRate: 1
    ingredients:
      'pistol infantry': 1
      'engineering kit': 1
    maintain:
      food: 1

  # Officers # # # # # # # #

  'infantry officer':
    techLevel: 2
    creationRate: 1
    ingredients:
      'pistol infantry': 1

  'logistics officer':
    techLevel: 2
    creationRate: 1
    ingredients:
        'pistol infantry': 1
  
  'intelligence officer':
    techLevel: 3
    creationRate: 1
    ingredients:
        'pistol infantry': 1

  'artillery officer':
    techLevel: 3
    creationRate: 1
    ingredients:
        'pistol infantry': 1

  'vehicle officer':
    techLevel: 3
    creationRate: 1
    ingredients:
        'pistol infantry': 1
  
  'airforce officer':
    techLevel: 4
    creationRate: 1
    ingredients:
        'pistol infantry': 1


  # Infantry resources # # # # # # # #

  "small arms":
    techLevel: 1
    creationRate: 5
    ingredients:
      alloy:      2
      explosive:  1
  
  'small arms ammo':
    techLevel: 1
    creationRate: 10
    ingredients:
      metal:      1
      explosive:  1

  "small rocket launcher":
    techLevel: 2
    creationRate: 1
    ingredients:
      alloy:            4
      explosive:        2
      fuel:             1
      "high explosive": 1
  
  'small rocket':
    techLevel: 2
    creationRate: 3
    ingredients:
      alloy:            1
      'high explosive': 1

  "engineering kit":
    techLevel: 3
    creationRate: 1
    ingredients:
      'small arms':     5
      alloy:            10
      combustible:      5
      fuel:             20
