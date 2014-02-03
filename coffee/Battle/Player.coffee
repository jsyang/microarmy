define ->
  class Player
    AI    : false
    team  : 0
    funds : 0 
    
    _canBuyPawn : (p) ->
      cost = p::COST
      cost += @battle.world.Classes.EngineerInfantry::COST if p instanceof @battle.world.Classes.Structure
      cost <= @funds
    
    _updateBuildButtons : ->
      @battle.ui.sidebar.updateBuildButtons()
    
    _removeFactory : (p) ->
      if p.buildable_type?
        factories = @factory[p.buildable_type]
        index = factories.indexOf p
        factories.splice index, 1
        @_updateBuildButtons()

    # Prunes undefineds from entity arrays.
    _updateEntityArray : (name) ->
      newArray = []
      for p in @[name]
        if p? and p.team is @team and not p.isDead() and not p.isPendingRemoval()
          newArray.push p
      @[name] = newArray
    
    _addBuildCapability : (p) ->
      if p.buildable_type?
        @battle.EVA.NEW_CONSTRUCTION_OPTIONS() unless @AI
          
        if p.buildable_type instanceof Array
          for type in p.buildable_type when @buildable_units.indexOf(type) is -1
            if @battle.world.Classes[type].__super__.constructor.name is 'Structure'
              @buildable_structures.push type
            else
              @factory[type] = [p] unless @factory[type]?
              @factory[type].push p
              @buildable_units.push type
        else
          type = p.buildable_type
          if @battle.world.Classes[type] instanceof @battle.world.Classes.Structure
            @buildable_structures.push type
          else
            @buildable_units.push type
            @factory[type] = [p]
          
        @_updateBuildButtons()
      
    
    sendEngineerToBuildStructure : (name, x, direction) ->
      f = @factory['EngineerInfantry']
      if f? and f.length > 0
        if @_canBuyPawn @battle.world.Classes[name]
          f = f[0]
          f.build_structure           = true
          f.build_structure_x         = x
          f.build_structure_type      = name
          f.build_structure_direction = direction
          @funds -= @battle.world.Classes[name]::COST
          @build 'EngineerInfantry'
        else if not @AI
          @battle.EVA.INSUFFICIENT_FUNDS()
          
    # Called from Behaviors.
    removeEntity : (p) ->
      return unless p.team is @team
      if p instanceof @battle.world.Classes.Structure
        arrayName = 'structures'
        @_removeFactory p
        @_updateBuildButtons()
      else
        arrayName = 'units'      
      index = @[arrayName].indexOf(p)
      delete @[arrayName][index] unless index is -1
      @_updateEntityArray(arrayName)

    build : (name) ->
      throw new Error "Player tried to build with a type name!" unless name?
    
      buildClass = @battle.world.Classes[name]
      if @_canBuyPawn buildClass
        if @factory[name]?
          factory = @factory[name][0]
          if factory.build_type?
            # Already building something.
            # todo: build queue
            @battle.ui.sound.INVALID() unless @AI
          else
            factory.build_type = name
            @funds -= buildClass::COST
            @battle.ui.sound.BUILDING() unless @AI
            @battle.EVA.BUILDING()      unless @AI
      else if not @AI
        @battle.EVA.INSUFFICIENT_FUNDS()
    
    addEntity : (p) ->
      if p instanceof @battle.world.Classes.Structure
        @structures.push p
        @_addBuildCapability p
      else
        @units.push p
        
    constructor : (params) ->
      @[k] = v for k, v of params
      @structures = []
      @units      = []
      
      @factory    = {} # What structures are available to build things
      
      @buildable_structures = []
      @buildable_units      = []
      
      @structures_under_construction = []