define ->
  
  # Main purpose of this class is to check whether the game has ended, and provide specific action
  # handlers for the gameplay mode
  
  # A survival game can only end in one way: player base is overwhelmed and player is defeated.
  
  # 1. Check if wave has been destroyed / beaten into retreat.
  # 2. Check if player has lost.
  # 3. Check if player has placed all
  
  class Survival
    
    COST :
      PistolInfantry    : 50
      RocketInfantry    : 200
      EngineerInfantry  : 400
  
      CommCenter        : 18000
      Barracks          : 9000
      CommRelay         : 2000
      WatchTower        : 1000
      AmmoDump          : 1000
      AmmoDumpSmall     : 1000
      MineFieldSmall    : 700
      Depot             : 1000
      RepairYard        : 1000
      Helipad           : 1000
      Pillbox           : 3000
      SmallTurret       : 8000
      MissileRack       : 32000
      MissileRackSmall  : 16000
      
    MODE :
      BASECONSTRUCTION : 0
      DEFENSE : 1
      OFFENSE : 2
      IDLE    : 3

    fund :
      qty   : 1000    # Current funding level
      rate  : 100     # How many funds do we get per 100 cycles?
      
    kit :             # Base starter kit
      Structure :
        Barrack : 1
        Pillbox : 1
    
    mode : null
      
    constructor : (params) ->
      @[k]  = v for k, v of params
      @mode = @MODE.BASECONSTRUCTION
      
    tick : ->
      ac = atom.context
      
      switch @mode
        when @MODE.BASECONSTRUCTION
          ac.drawText 'Base construction mode.'
        else
          null