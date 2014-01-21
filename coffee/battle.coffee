define [
  'core/Behaviors'
  'core/Battle/behaviors'
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
  
  'core/Battle/UI/minimap'
  'core/Battle/gameplay/constructbase'
], (Behaviors, BattleBehaviors, World, makeBackgroundImageData, BattleUIMinimap, ConstructBase) ->
  
  class Battle
  
    MODE : 
      constructbase : ConstructBase
        
    scroll :
      x : 0
      y : 0
      
    mouse :
      lastX   : 0
      lastY   : 0
      isdown  : 0
      
    team : 0
    
    constructor : (params) ->
      @[k] = v for k, v of params
      
      # world = a battle's "model"
      @world = new World {
        w      : 3200
        h      : 500
        battle : @
      }
      
      # background = sky + terrain layer, sits below the instances drawn layer
      @backgroundImgData = makeBackgroundImageData(@world)
      
      # behaviors = btree interpreter
      @behaviors = new Behaviors(BattleBehaviors(@world, @world.Classes))
      
      # Controller
      @mode = new @MODE.constructbase { battle : @ }
      
      # Various UI components
      @ui =
        minimap : new BattleUIMinimap { world : @world }
    
    tick : ->
      #mx = atom.input.mouse.x
      #my = atom.input.mouse.y
      #
      ## Start drag
      #if atom.input.down('mouseleft')
      #  @scroll.x += mx - @mouse.lastX
      #  @scroll.y += my - @mouse.lastY
      #
      #@mouse.lastX = mx
      #@mouse.lastY = my
      
      @mode.tick()
      @ui.minimap.tick()
      @world.tick()
      
    draw : ->
      @_drawBackground(-@scroll.x, -@scroll.y) # scroll position
      
      # Drawing order is based on primitiveCLasses
      for type in @world.primitiveClasses
        for p in @world.Instances[type]
          atom.context.drawSprite(p.gfx())
      
      @mode.draw()
      @ui.minimap.draw()
        
    _drawBackground : (x = 0, y = 0) ->
      atom.context.putImageData(@backgroundImgData, x, y)