define [
  'core/Battle/addTerrain'
  
  # Functions to attach Class constructors for the various types of Pawns
  'core/Battle/Pawn/Structure'
  'core/Battle/Pawn/Explosion'
  'core/Battle/Pawn/Infantry'
  'core/Battle/Pawn/Projectile'
  
  'core/util/XHash'
  'core/util/SimpleHash'
], (addTerrain, addStructureClasses, addExplosionClasses, addInfantryClasses, addProjectileClasses, XHash, SimpleHash) ->

  class BattleWorld
  
    # Also used for drawing order
    primitiveClasses : [
      'Structure'
      #'Vehicle'
      #'Aircraft'
      'Infantry'
      'Projectile'
      'Explosion'
      #'PawnController'
    ]
  
    # battle : null # the parent battle instance.
    Classes   : {}
  
    # Make the instances dict so we have an empty structure to add pawn instances to.
    initInstancesDict : (name) ->
      @[name] = {}
      ( @[name][className] = [] ) for className in @primitiveClasses
  
    tick : ->
      @createNewXHash()
      @createNewInstances()
      
      for k, v of @Instances
        for entity in v
          if !entity.isPendingRemoval()
            btree = entity._.behavior ? entity.constructor.name
            btree = @battle.behaviors.Trees[btree]
            
            if btree?
              @battle.behaviors.Execute(entity, btree)
              @add(entity)
      
      # Replace the old xhash and instances with new ones
      @XHash     = @XHash_
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
      x = if isNaN(p) then p.x>>0 else p>>0
      @heightmap[x]
  
    contains : (entity) ->
      [x, y] = [entity.x>>0, entity.y>>0]
      !(x<0 || x>=@w || y>@heightmap[x])
  
    add : (entity) ->
      # Add to temp if add() called inside a tick
      # Otherwsie add to actual xhash if we're outside of a tick
      xh = @XHash_ ? @XHash
      i  = @Instances_ ? @Instances
      
      for type in @primitiveClasses when entity instanceof @Classes[type]
        xh.add(p) unless !entity.isTargetable()
        if entity._.corpsetime > 0
          return i[type].push entity
        else
          return
        
    constructor : (params) ->
      @[k]  = v for k, v of params
      
      dimensions =
        w : @w
        h : @h
      
      @XHash     = new XHash dimensions
      @DeathHash = new SimpleHash dimensions
      
      @initInstancesDict 'Instances'
      
      addStructureClasses   @Classes
      addInfantryClasses    @Classes
      addExplosionClasses   @Classes
      addProjectileClasses  @Classes
      
      addTerrain @