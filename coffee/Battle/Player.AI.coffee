define ['core/Battle/Player'], (Player) ->
  class AIPlayer extends Player  
    SQUAD_SEND_TO_ATTACK : ->
    
    BUILD_SQUAD : ->
      @build 'PistolInfantry'
      
    CONSTRUCT_INITIAL_BASE : ->
      for k, v of @starting_inventory
        if v > 0
          # todo: structure placement is still a little bit weird.
          temp_instance = new @battle.world.Classes[k] { team : @team }
          x = @build_x
          until @_checkBuildLocationValid(x, temp_instance) or x < 0
            x += @dx * $.R(1,8)
            
          unless x < 0
            entity = @battle.MODE.ConstructBase::addEntityToWorld.call(@, k, x)
            @addEntity entity
            @commands.push 'CONSTRUCT_INITIAL_BASE'
            @starting_inventory[k]--
            
            @build_x = x
        else
          delete @starting_inventory[k]
          return

    _checkBuildLocationValid : (x, t) ->
      cb = @battle.MODE.ConstructBase
      check1 = cb::checkLocationTerrain.call @, x, t
      check2 = cb::checkLocationEmptyOfExistingStructure.call @, x
      check1 and check2

    _processNextCommand : ->
      if @commands.length > 0
        command = @commands.shift()
        @[command]()
  
    tick : ->
      @_processNextCommand()

    LOCATIONVALIDTHRESHOLD : 0.35 # Duplicated from core/Battle/mode/constructbase

    build_x : 0

    constructor : (params) ->
      super params
      @direction = 0
      @dx = [-1, 1][@direction]
      @build_x = @battle.world.w - $.R(20,80)