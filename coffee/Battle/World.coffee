define [
  'core/Battle/addTerrain'
  'core/Battle/addPropsToWorld'
  
  # Functions to attach Class constructors for the various types of Pawns
  'core/Battle/Pawn/Structure'
  'core/Battle/Pawn/Explosion'
  'core/Battle/Pawn/Infantry'
  'core/Battle/Pawn/Projectile'
  'core/Battle/Pawn/Aircraft'
  'core/Battle/Pawn/Prop'
    
  'core/util/XHash'
  'core/util/SimpleHash'
], (addTerrain,
    addPropsToWorld,
    addStructureClasses,
    addExplosionClasses,
    addInfantryClasses,
    addProjectileClasses,
    addAircraftClasses,
    addPropClasses,
    XHash,
    SimpleHash) ->

  class BattleWorld
    w : 4000
    h : 500
  
    primitiveClasses : [  # Also used for drawing order
      'Prop'
      'Structure'
      #'Vehicle'
      'Aircraft'
      'Infantry'
      'Projectile'
      'Explosion'
      #'PawnController'
    ]
  
    # battle : = the parent battle instance.
    Classes   : {}
  
    # Make the instances dict so we have an empty structure to add pawn instances to.
    initInstancesDict : (name) ->
      @[name] = {}
      for className in @primitiveClasses
        @[name][className] = []
  
    tick : ->
      @createNewXHash()
      @createNewInstances()

      for k, v of @Instances
        for entity in v when !entity.isPendingRemoval()
          # Props are only drawn.
          unless k is 'Prop'
            btree = entity.behavior ? entity.constructor.name
            btree = @battle.behaviors.Trees[btree]
            @battle.behaviors.Execute(entity, btree)
          @add(entity)
  
      @XHash     = @XHash_        # Replace the old xhash and instances with new ones
      @Instances = @Instances_
      
      delete @XHash_
      delete @Instances_
  
    createNewXHash : ->
      @XHash_ = new XHash {
        w : @w
        h : @h
      }
    
    createNewInstances : ->
      @initInstancesDict 'Instances_'
      
    height : (p) ->
      # Can use either a Pawn or an X value as the query
      x = if isNaN(p) then p.x >> 0 else p >> 0
      @heightmap[x]
  
    contains : (entity) ->
      x = entity.x >> 0
      y = entity.y >> 0
      !(x < 0 || x >= @w || y > @heightmap[x])
  
    add : (entity) ->
      # Add to temporary structure if add() called inside a tick
      # Otherwise add to actual ones if we're outside of a tick
      xh = @XHash_ ? @XHash
      i  = @Instances_ ? @Instances
      for type in @primitiveClasses when entity instanceof @Classes[type]
        xh.add entity unless !entity.isTargetable()
        if entity.corpsetime > 0
          return i[type].push entity
        
    constructor : (params) ->
      @[k]  = v for k, v of params
      
      dimensions =
        w : @w
        h : @h
      
      @XHash     = new XHash      dimensions
      @DeathHash = new SimpleHash dimensions
      
      @initInstancesDict 'Instances'
      
      addStructureClasses   @Classes
      addInfantryClasses    @Classes
      addExplosionClasses   @Classes
      addProjectileClasses  @Classes
      addAircraftClasses    @Classes
      addPropClasses        @Classes
      
      addTerrain      @
      addPropsToWorld @