define ->
  # todo : AIPlayer extends Player
  class Player
    is_ai : false
    team  : 0
    funds : 0
    
    constructor : (params) ->
      @[k] = v for k, v of params
      @structures = []
      @units      = []
      
      @factory    = {} # What structures are available to build things
      
      @buildable_structures = []
      @buildable_units      = []
      
      #@unbuildable_locations = []
    
    build : (name) ->
      buildClass = @battle.world.Classes[name]
      if @_canBuyPawn buildClass
        factory = @factory[name][0]
        if factory.build_type?
          # Already building something.
          # todo: build queue
          atom.playSound 'invalid'
        else
          factory.build_type = name
          @funds -= buildClass::COST
          atom.playSound 'feed'
      else
        atom.playSound 'invalid'
    
    _canBuyPawn : (p) ->
      p::COST <= @funds
    
    _updateBuildButtons : ->
      @battle.ui.sidebar.updateBuildButtons()
    
    _removeFactory : (p) ->
      if p.buildable_type?
        factories = @factory[p.buildable_type]
        index = factories.indexOf p
        factories.splice index, 1
        @_updateBuildButtons()
    
    removeEntity : (p) ->
      return unless p.team is @team
      if p instanceof @battle.world.Classes.Structure
        arrayName = 'structures'
        @_removeFactory p
      else
        arrayName = 'units'      
      index = @[arrayName].indexOf(p)
      delete @[arrayName][index] unless index is -1
      @_updateEntityArray(arrayName)

    # Prunes undefineds from entity arrays.
    _updateEntityArray : (name) ->
      newArray = []
      for p in @[name]
        if p? and p.team is @team and not p.isDead() and not p.isPendingRemoval()
          newArray.push p
      @[name] = newArray
    
    _addBuildCapability : (p) ->
      if p.buildable_type?
        if p.buildable_type instanceof Array
          # not used yet
          for type in p.buildable_type when @buildable_units.indexOf(type) is -1
            @buildable_units = @buildable_units.concat p.buildable_type
        else
          @buildable_units.push p.buildable_type
          @factory[p.buildable_type] = [p]
        @_updateBuildButtons()
    
    addEntity : (p) -> # Calls to this should be explicit
      if p instanceof @battle.world.Classes.Structure
        @structures.push p
        @_addBuildCapability p
      else
        @units.push p