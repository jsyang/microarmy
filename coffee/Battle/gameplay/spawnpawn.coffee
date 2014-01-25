define ['core/Battle/UI'], (BattleUI) ->
  
  CLASSES = [
    #'CommCenter'
    #'Barracks'
    #'Scaffold'
    #'CommRelay'
    #'WatchTower'
    #'AmmoDump'
    #'AmmoDumpSmall'
    #'MineFieldSmall'
    #'Depot'
    #'RepairYard'
    #'Helipad'
    'Pillbox'
    'SmallTurret'
    'MissileRack'
    'MissileRackSmall'
    #'HomingMissile'
    #'HomingMissileSmall'
    'PistolInfantry'
    #'RocketInfantry'
    #'EngineerInfantry'
    #'FragExplosion'
    #'SmallExplosion'
    #'FlakExplosion'
    #'HEAPExplosion'
    ##'ChemExplosion'
    #'SmokeCloud'
    #'SmokeCloudSmall'
    #'Flame'
    #'ChemCloud'
  ]
  
  class SpawnPawn extends BattleUI
    x         : 0
    y         : 0
    team      : 0
    direction : 0
    index     : 0
    
    CLASSES : CLASSES
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
    
    draw : ->
      teamName = [
        'blue'
        'green'
      ][@team]
      
      directionName = [
        'left'
        'right'
      ][@direction]
      
      instructionText = [
        "Click to create #{CLASSES[@index]} for #{teamName} team"
        "Press A / D to face left / right :: facing #{directionName}"
        "Press W to toggle team"
        "Press S to select entity"
      ]
      atom.context.drawText instructionText
      
    tick : ->
      if @containsCursor()
        # Direction
        if atom.input.pressed('keyA')
          @direction = 0
        else if atom.input.pressed('keyD')
          @direction = 1
        
        # Class
        if atom.input.pressed('keyS')
          @index++
          @index = 0 if @index >= CLASSES.length
        
        # Team
        if atom.input.pressed('keyW')
          @team++
          @team %= 2
        
        # Spawn this thing!
        if atom.input.pressed('mouseleft')
          mx = atom.input.mouse.x
          my = atom.input.mouse.y
          
          x = mx + @battle.scroll.x
          y = my
          
          classes = @battle.world.Classes
          instanceClass = classes[CLASSES[@index]]
                    
          pawn = new @battle.world.Classes[CLASSES[@index]] {
            x         : x
            y         : y
            team      : @team
            direction : @direction
          }
          
          @battle.world.add pawn