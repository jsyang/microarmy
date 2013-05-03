define [
  # Model sub
  'core/Behaviors'
  'core/Battle/behaviors'
  
  # Model
  'core/Battle/World'
  
  # Views
  'core/Battle/view/map'

  # Map Autoscroll
  'core/util/autoscroll'

  # Gameplay type
  'core/Battle/gameplay/survival'

], (Behaviors, BattleBehaviors, World, Map, Autoscroll, SURVIVAL) ->
  
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
      @World.Battle = @ # parent ref
      @Behaviors    = new Behaviors(BattleBehaviors(@World, @World.Classes))

      @render()
      
      @Gameplay     = new SURVIVAL.GAMEPLAY(@World, @views.Map)
      @addUI(SURVIVAL.UI)
      
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

      # Misc actions that happen per tick. Depending on the gameplay
      @Gameplay.perTick() if @Gameplay.perTick?
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
    
    addUI : (UIevents)->
      if @views?
        Autoscroll(@views.Map, @World)
        # Bind list of UI events
        (
          $.addEvent(handler.context, eventName, handler.func)
        ) for eventName,handler of UIevents(@views.Map, @World, @Gameplay)
      else
        throw new Error 'views must be set up prior to addUI()'