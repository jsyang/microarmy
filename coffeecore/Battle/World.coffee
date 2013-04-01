define [

  # World builders
  'core/Battle/addTerrain'
  
  # Classes
  'core/Battle/Pawn/Explosion'
  'core/Battle/Pawn/Infantry'
  'core/Battle/Pawn/Projectile'
  
  # Utils
  'core/Battle/XHash'
  'core/Battle/SimpleHash'
  
], (Terrain, Explosion, Infantry, Projectile, XHash, SimpleHash) ->

  classFactories = [
    Explosion
    Infantry
    Projectile
  ]
  
  worldBuilders = [
    Terrain
  ]

  class BattleWorld
  
    primitiveClasses : [
      #'Vehicle'
      #'Structure'
      'Infantry'
      'Projectile'
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
      # Can use either a Pawn or an X value as the query
      x = if isNaN(p) then p._.x>>0 else p>>0
      @_.heightmap[x]
  
    contains : (p) ->
      [x,y] = [p._.x>>0, p._.y>>0]
      !(x<0 || x>=@_.w || y>@_.heightmap[x])
  
    add : (p) ->
      for type in @primitiveClasses
        if p instanceof @Classes[type]
          @XHash.add(p) # addFilterDead
          return @Instances[type].push(p)