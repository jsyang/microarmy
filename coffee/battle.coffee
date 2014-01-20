define [
  'core/Behaviors'
  'core/Battle/behaviors'
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
], (Behaviors, BattleBehaviors, World, makeBackgroundImageData) ->
  
  class Battle
  
    scroll :
      x : 0
      y : 0
      
    mouse :
      lastX   : 0
      lastY   : 0
      isdown  : 0
  
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
    
    tick : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      
      # Start drag
      if atom.input.down('mouseleft')
        @scroll.x += mx - @mouse.lastX
        @scroll.y += my - @mouse.lastY
      
      
      @mouse.lastX = mx
      @mouse.lastY = my
      
      @world.tick()
      
    draw : ->
      @_drawBackground(@scroll.x, @scroll.y) # scroll position
      
      # Drawing order is based on primitiveCLasses
      for type in @world.primitiveClasses
        for p in @world.Instances[type]
          atom.context.drawSprite(p.gfx())
        
    _drawBackground : (x = 0, y = 0) ->
      atom.context.putImageData(@backgroundImgData, x, y)