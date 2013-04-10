define [
  # Model sub
  'core/Behaviors'
  'core/Battle/behaviors'
  
  # Model
  'core/Battle/World'
  
  # Views
  'core/Battle/view/map'
  
  # Controllers
  'core/Battle/addUI'
], (Behaviors, BattleBehaviors, World, Map, addUI) ->
  
  views = {
    Map
  }
  
  class Battle
  
    constructor : (_) ->
      @_ = $.extend {
        w : 3200
        h : 480
      }, _
      
      @_.world   = new World(@_)
      @Behaviors = new Behaviors(BattleBehaviors(@_.world, @_.world.Classes))
    
    # Create the DOM elements
    render : ->
      @views = {}
      (
        @views[k] = v(@_.world)
        document.body.appendChild @views[k]
      ) for k,v of views
      @
      
    # Apply behaviors to the models held in the world.
    tick : ->
      world = @_.world
      world.createNewXHash()
      world.createNewInstances()
      (
        (
          if !p.isPendingRemoval()
            btree = if p._.behavior? then p._.behavior else p.constructor.name
            btree = @Behaviors.Trees[btree]
            
            if btree?
              @Behaviors.Execute(p, btree)
              world.add(p)
                
            else
              throw new Error 'no behaviors found for instance of '+p.constructor.name
        ) for p in v
      ) for k,v of world.Instances
      
      world.XHash     = world.XHash_
      world.Instances = world.Instances_
      
      delete world.XHash_
      delete world.Instances_
      @
  
    # Visualize the current state of the world.
    redraw : ->
      mapctx  = @views?.Map?.ctx
      world   = @_.world
      if mapctx? and world?
        mapctx.clear()
        
        # Drawing order is important here.
        # todo: skip drawing things that we can't see
        (
          (
            mapctx.draw(p.gfx())
          ) for p in world.Instances[type]
        ) for type in world.primitiveClasses
        
      else
        throw new Error 'no map view to redraw!'
      @
    
    
    cycle : ->
      @tick()
      @redraw()
      @
    
    play : (self=@) ->
      @_.timer = setInterval((-> self.cycle()), 40)
      @
    
    pause : ->
      clearInterval(@_.timer)
      @
    
    addUI : addUI