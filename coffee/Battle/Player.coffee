define [
  'core/Battle/Player.Build'
], (PlayerBuild) ->
  class Player
    AI         : false
    team       : 0
    funds      : 0 
    tech_level : 99
    
    canBuyPawnName : (name) -> @buildsystem.canBuy name
    
    _updateBuildButtons : ->
      @battle.ui.sidebar.updateBuildButtons()
    
    _removeFactory : (p) ->
      return unless p.buildable_primitives?
      for primitive in p.buildable_primitives
        newFactories = []
        for f in @factory[primitive]
          newFactories.push f unless f is p
        @factory[primitive] = newFactories
        @_updateBuildButtons()

    # Prunes undefineds from entity arrays.
    _updateEntityArray : (name) ->
      newArray = []
      for p in @[name]
        if p? and p.team is @team and not p.isDead() and not p.isPendingRemoval()
          newArray.push p
      @[name] = newArray
    
    _addBuildCapability : (p) ->
      if p.buildable_primitives?
        @battle.EVA.NEW_CONSTRUCTION_OPTIONS() unless @AI
        
        for primitive in p.buildable_primitives
          if @factory[primitive]?
            @factory[primitive].push p
          else
            @factory[primitive] = [p]
        
        for type in p.buildable_types
          if @battle.world.Classes[type].__super__.constructor.name is 'Structure'
            if @buildable_structures[type]?
              @buildable_structures[type]++
            else
              @buildable_structures[type] = 1
          else
            if @buildable_units[type]?
              @buildable_units[type]++
            else
              @buildable_units[type] = 1
        @_updateBuildButtons()
    
    _updateBuiltEntityTally : (type, p) ->
      if @["built_#{type}"][p.constructor.name]?
        @["built_#{type}"][p.constructor.name]++
      else
        @["built_#{type}"][p.constructor.name] = 1
          
    # Called from Behaviors.
    removeEntity : (p) ->
      return unless p.team is @team
      if p instanceof @battle.world.Classes.Structure
        arrayName = 'structures'
        @_removeFactory p
        @_updateBuildButtons()
      else
        arrayName = 'units'
      index = @[arrayName].indexOf p
      delete @[arrayName][index] unless index is -1
      @_updateEntityArray arrayName

    build : (name, x, direction, noQueueActions) ->
      @buildsystem.sendBuildOrder name, x, direction, noQueueActions
      @battle.ui.sound.BUILDING() unless @AI
      # @battle.EVA.BUILDING()      unless @AI
    
    addEntity : (p) ->
      if p instanceof @battle.world.Classes.Structure
        @structures.push p
        @_addBuildCapability p
        @_updateBuiltEntityTally 'structures', p
      else
        @units.push p
        @_updateBuiltEntityTally 'units', p
        
    constructor : (params) ->
      @[k] = v for k, v of params
      
      # Track currently alive entities
      @structures = []
      @units      = []
      
      # Track things that can build all entities under a primitive type
      @factory    = {}
      # ex =
      #   Infantry : [ Barracks, Barracks, CommCenter, ...]
      #   Vehicles : [ Depot, ... ]
      #   Aircraft : [ Helipad, Airstrip, ...]
      
      # Track of entities that have been built and their number (to test if they have been lost)
      @built_structures = {}
      @built_units      = {}
      
      # Track specific buildable entities
      @buildable_structures = {}
      @buildable_units      = {}
      
      # Queuing  
      @buildsystem = new PlayerBuild {
        battle : @battle
        player : @
      }