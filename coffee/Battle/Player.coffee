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
    
    canBuyPawn : (p) ->
      p.COST <= @funds
    
    removeEntity : (p) ->
      return unless p.team is @team
      if p instanceof @battle.world.Classes.Structure
        arrayName = 'structures'
        
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
          for type in p.buildable_type when @buildable_units.indexOf(type) is -1
            @buildable_units = @buildable_units.concat p.buildable_type
        else
          @buildable_units.push p.buildable_type
        @battle.ui.sidebar.updateBuildButtons()
          
    # todo : _addBuildTree : ->
    
    addEntity : (p) -> # Calls to this should be explicit
      if p instanceof @battle.world.Classes.Structure
        @structures.push p
        @_addBuildCapability p
      else
        @units.push p