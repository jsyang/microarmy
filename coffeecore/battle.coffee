define [
  'core/Behaviors'
  'core/Behaviors/battle'
  
  # Classes
  'core/Battle/Pawn/Explosion'
  
  # World builders
  'core/Battle/addTerrain'
  
  # Utils
  'core/Battle/XHash'
  'core/Battle/SimpleHash'
  
  # UI
  'core/Battle/view/map'
  
  # Controller
  'core/Battle/addUI'
], (Behaviors, BattleBehaviors, Explosion, Terrain, XHash, SimpleHash, Map, addUI) ->

  worldBuilders = [
    Terrain
  ]
  
  views = {
    Map
  }
  
  childClasses = {
    Explosion
  }
  
  class Battle
    constructor : (_) ->
      @_ = $.extend {
        w : 3200
        h : 480 
        pawns : {
          Explosion : []
        }
      }, _
      
      world = @_
      (world = addTo(world)) for addTo in worldBuilders
      
      # Add Hashes here for now...
      @world._.XHash     = new XHash      ({ w:@_.w })
      @world._.DeathHash = new SimpleHash ({ w:@_.w })
      
      @_.world = world
      
      
      # Assign World, Classes for 
      @Behaviors = new Behaviors(BattleBehaviors(world, childClasses))
    
    render : ->
      @views = {}
      (
        @views[k] = v(@_.world)
        document.body.appendChild @views[k]
      ) for k,v of views
      @
    
    cycle : ->
      newXHash = new XHash({ w:@_.w })
      newPawns = {}
      (
        newPawnsCollection = []
        (
          btree = if p._.behavior? then p._.behavior else p.constructor.name
          btree = @Behaviors.Trees[btree]
          
          if btree?
            @Behaviors.Execute(p, btree)
          else
            throw new Error 'no behaviors found for instance of '+p.constructor.name
          
          @views.Map.draw(p.gfx())
          
          if p._.corpsetime>0
            newPawnsCollection.push(p)
            if !p.isDead()
              newXHash.add(p)
        ) for p in v
        
        newPawns[k] = newPawnsCollection
      ) for k,v of @_.pawns
      
      @_.pawns = newPawns
      return
    
    play : ->
      self = @
      @_.timer = setInterval((-> self.cycle()), 60)
    
    pause : ->
      clearInterval(@_.timer)
    
    addUI : addUI
    