define [

  # World builders
  'core/Battle/addTerrain'
  
  # Classes
  'core/Battle/Pawn/Structure'
  'core/Battle/Pawn/Explosion'
  'core/Battle/Pawn/Infantry'
  'core/Battle/Pawn/Projectile'
  
  # Utils
  'core/Battle/XHash'
  'core/Battle/SimpleHash'
  
], (Terrain, Structure, Explosion, Infantry, Projectile, XHash, SimpleHash) ->

  classFactories = [
    Structure
    Explosion
    Infantry
    Projectile
  ]
  
  worldBuilders = [
    Terrain
  ]

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
    
    XHash       : null
    Instances   : {}
    Classes     : {}
  
    # Temporary structures for XHash and Instances (to hold stuff that gets added between a tick)
  
    initPrimitives  : (objName) ->
      @[objName] = {}
      ( @[objName][className] = [] ) for className in @primitiveClasses
      
    initInstances : -> @initPrimitives('Instances')
    initClasses   : -> addTo(@Classes) for addTo in classFactories
    initWorld     : -> addTo(@_)       for addTo in worldBuilders
  
    constructor : (_) ->
      @XHash      = new XHash     (_)
      @DeathHash  = new SimpleHash(_)
      @_          = $.extend {}, _
      
      @initInstances()
      @initClasses()
      @initWorld()
      
      @createNewXHash()
      @createNewInstances()
  
    createNewXHash      : -> @XHash_ = new XHash(@_)
    createNewInstances  : ->
      @initPrimitives('Instances_')
      
    height : (p) ->
      # Can use either a Pawn or an X value as the query
      x = if isNaN(p) then p._.x>>0 else p>>0
      @_.heightmap[x]
  
    contains : (p) ->
      [x,y] = [p._.x>>0, p._.y>>0]
      !(x<0 || x>=@_.w || y>@_.heightmap[x])
  
    add : (p) ->
      for type in @primitiveClasses
        if p instanceof @Classes[type]              
            # Add to temp if we're called inside a tick
            if @XHash_? and @Instances_?
              @XHash_.add(p) unless !p.isTargetable()
              if p._.corpsetime > 0
                return @Instances_[type].push(p)
              else
                return
            # Add to actual if we're outside of a tick
            else
              @XHash.add(p) unless !p.isTargetable()
              if p._.corpsetime > 0
                return @Instances[type].push(p)
              else
                return
            