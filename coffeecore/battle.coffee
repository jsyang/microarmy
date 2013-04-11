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
      
      @World        = new World(@_)
      @Behaviors    = new Behaviors(BattleBehaviors(@World, @World.Classes))
      # Parent ref: so World can refer to the Battle to which it belongs
      @World.Battle = @
      
    # Create the DOM elements
    render : ->
      @views = {}
      (
        @views[k] = v(@World)
        document.body.appendChild @views[k]
      ) for k,v of views
      @
      
    # Apply behaviors to the models held in the world.
    tick : ->
      @World.createNewXHash()
      @World.createNewInstances()
      (
        (
          if !p.isPendingRemoval()
            btree = if p._.behavior? then p._.behavior else p.constructor.name
            btree = @Behaviors.Trees[btree]
            
            if btree?
              @Behaviors.Execute(p, btree)
              @World.add(p)
                
            else
              throw new Error 'no behaviors found for instance of '+p.constructor.name
        ) for p in v
      ) for k,v of @World.Instances
      
      @World.XHash     = @World.XHash_
      @World.Instances = @World.Instances_
      
      delete @World.XHash_
      delete @World.Instances_
      @
  
    # Visualize the current state of the world.
    redraw : ->
      mapctx  = @views?.Map?.ctx
      if mapctx? and @World?
        mapctx.clear()
        # Drawing order is based on primitiveCLasses
        (
          (
            mapctx.draw(p.gfx())
          ) for p in @World.Instances[type]
        ) for type in @World.primitiveClasses
        
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