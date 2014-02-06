define ->
  class PlayerBuild
    # Tracks what build orders from a Player
    queue : {}
    
    getCost : (name) ->
      pawnClass = @battle.world.Classes[name]
      pawnType  = pawnClass.__super__.constructor.name
      cost = pawnClass::COST
      cost += @battle.world.Classes.EngineerInfantry::COST if pawnType is 'Structure'
      cost
    
    canBuy : (name) ->
      pawnClass = @battle.world.Classes[name]
      hasTech  = pawnClass::tech_level <= @player.tech_level
      hasFunds = @getCost(name) <= @player.funds
      hasTech and hasFunds

    isBuildable : (name) ->
      name of @player.buildable_structures or
      name of @player.buildable_units

    _removeFromQueue : (name) ->
      @queue[name]--
      delete @queue[name] unless @queue[name] > 0
      
    _addToQueue : (name) ->
      if @canBuy name
        @queue[name] = @queue[name] or 0
        @queue[name]++
      else
        @battle.ui.sound.INVALID() unless @AI

    sendBuildOrder : (name, x, direction, noQueueActions) ->
      unless @canBuy(name) and @isBuildable(name)
        return
        
      pawnClass = @battle.world.Classes[name]
      pawnType  = pawnClass.__super__.constructor.name
      pawnPrerequisiteSatisfied = true
      
      # Make sure we have everything we need to build.
      if pawnClass.prerequisites?
        prerequisitiesSatisfied = 0
        for p in pawnClass.prerequisites
          for s in @player.structures
            if s instanceof @battle.world.Classes[p]
              prerequisitiesSatisfied++
              break
        pawnPrerequisiteSatisfied = prerequisitesSatisfied is pawnClass.prerequisites.length
      
      if pawnPrerequisiteSatisfied
        if pawnType is 'Structure'
          pawnType    = 'Infantry'
          order = 
            build_type                : 'EngineerInfantry'
            build_structure           : true
            build_structure_x         : x
            build_structure_type      : name
            build_structure_direction : direction
        else
          order =
            build_type : name
          
        for factory in @player.factory[pawnType]
          isIdle       = not factory.build_type?
          canBuildType = order.build_type in factory.buildable_types
          # Send the build order to an idle factory.
          if isIdle and canBuildType
            factory[k] = v for k,v of order
            @player.funds -= @getCost name
            @_removeFromQueue name
            return
        # Couldn't find a factory that's free; queuing.
        @_addToQueue name unless noQueueActions
      return

    tick : ->
      for name, qty of @queue
        if qty is 0
          delete @queue[name]
        else
          @sendBuildOrder name, null, null, true

    constructor : (params) ->
      @[k] = v for k, v of params
      