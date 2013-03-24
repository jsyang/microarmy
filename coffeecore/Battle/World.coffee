define [

  # World builders
  'core/Battle/addTerrain'
  
  # Classes
  'core/Battle/Pawn/Explosion'
  
  # Utils
  'core/Battle/XHash'
  'core/Battle/SimpleHash'
], (Terrain, Explosion, XHash, SimpleHash) ->

  classFactories = [
    Explosion
  ]
  
  worldBuilders = [
    Terrain
  ]

  class BattleWorld
  
    primitiveClasses : [
      #'Vehicle'
      #'Structure'
      #'Infantry'
      #'Projectile'
      'Explosion'
      #'Aircraft'
      #'PawnController'
    ]
  
    Instances : {}
    Classes   : {}
  
    initInstances : -> ( @Instances[className] = [] ) for className in @primitiveClasses
    initClasses   : -> addTo(@Classes) for addTo in classFactories
    initWorld     : -> addTo(@_)       for addTo in worldBuilders
  
    constructor : (_) ->
      @XHash      = new XHash     (_)
      @DeathHash  = new SimpleHash(_)
      
      @_ = $.extend {}, _
      
      @initInstances()
      @initClasses()
      @initWorld()
      
      window.battleworld = @
  
    createNewXHash : -> new XHash(@_)
  
    height : (p) ->
      if isNaN(p)
        # Pawn used as the query
        @_.heightmap[p._.x>>0]
      else
        # X used as the query
        @_.heightmap[p>>0]
  
    add : (p) ->
      for type in @primitiveClasses
        if p instanceof @Classes[type]
          return @Instances[type].push(p)