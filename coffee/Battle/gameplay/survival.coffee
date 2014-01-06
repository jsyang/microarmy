define [
  'core/Battle/gameplay/survivalUI'
], (UI) ->

  # Main purpose of this class is to check whether the game has ended
  # A survival game can only end in one way: player base is overwhelmed and player is defeated.
  
  # 1. Check if wave has been destroyed / beaten into retreat.
  # 2. Check if player has lost.
  # 3. Check if player has placed all 
  
  CONST =
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
      
    STAGES :
      BASECONSTRUCTION : 0
      DEFENSE : 1
      OFFENSE : 2
      IDLE    : 3
  
  class Survival
    CONST       : CONST
    difficulty  : 1
    
    WORLD       : 'reference to battle world'
    MAP         : 'reference to battle map'
    
    UI          : # UI triggers and flags
      mouse :
        X : null
        Y : null
    
    constructor : (WORLD, MAP) ->
      @current.funds = $.R(10,50)*@difficulty*25
      @WORLD  = WORLD
      
      
    current :
      inventory   : ['Barrack','Pillbox']
      stage       : CONST.STAGES.BASECONSTRUCTION
      fundingRate : 1
      funds       : 0
    
    setMap : (MAP) -> @MAP = MAP
    
    handleStage : ->
      ctx = @MAP.ctx
      
      switch @current.stage
      
        when @CONST.STAGES.BASECONSTRUCTION          
          nextUnit = @current.inventory[0]
          
          ctx.text({
            text  : "Initial base construction.\nClick to lay down #{nextUnit}."
            color : 'red'
            x     : 10
            y     : 10
          })
          
          if @UI.mouse.x?
            ctx.highlight({
              x     : @UI.mouse.x
              color : 'green'
              w     : 32
            })
    
    perTick : ->
      @handleStage()
      
      
    



  return {
    GAMEPLAY : Survival
    UI : UI
  }

