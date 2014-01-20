define [
  'core/Behaviors'
  'core/Battle/behaviors'
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
], (Behaviors, BattleBehaviors, World, makeBackgroundImageData) ->
  
  class Battle
  
    constructor : (params) ->
      @[k] = v for k, v of params
      
      @world = new World {
        w      : 3200
        h      : 480
        battle : @
      }
      
      # background = sky + terrain layer, sits below the instances drawn layer
      @backgroundImgData = makeBackgroundImageData(@world)
      
      # behaviors = btree interpreter
      @behaviors = new Behaviors(BattleBehaviors(@world, @world.Classes))
      
      # world = a battle's "model"
      @tick = @world.tick.bind(@world)
    
    #tick : ->
     
    draw : ->
      if @world?
        @_drawBackground() # scroll position
        
        # Drawing order is based on primitiveCLasses
        for type in @world.primitiveClasses
          for p in @world.Instances[type]
            atom.context.drawSprite(p.gfx())
        
    _drawBackground : (x = 0, y = 0) ->
      atom.context.putImageData(@backgroundImgData, x, y)