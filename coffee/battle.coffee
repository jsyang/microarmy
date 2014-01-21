define [
  'core/Behaviors'
  'core/Battle/behaviors'
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
  
  'core/Battle/UI/minimap'
  'core/Battle/gameplay/constructbase'
  'core/Battle/gameplay/selectpawn'
], (Behaviors, BattleBehaviors, World, makeBackgroundImageData, BattleUIMinimap, ConstructBase, SelectPawn) ->
  
  class Battle
  
    MODE : {
      ConstructBase
      SelectPawn    # nothing selected, idling UI
      #CommandPawn  # unit(s) selected, awaiting commands
    }
        
    scroll :
      margin : 50 # if something is closer than this to the viewport, render it
      x : 0
      y : 0
    
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
      @mode = new @MODE.ConstructBase { battle : @ }
      
      # Various UI components
      @ui =
        minimap : new BattleUIMinimap { world : @world }
    
    switchMode : (mode) ->
      @mode = new @MODE[mode] { battle : @ }
    
    tick : ->
      @mode.tick()
      @ui.minimap.tick()
      @world.tick()
      
    draw : ->
      @_drawBackground(-@scroll.x, -@scroll.y) # scroll position
      
      # Drawing order is based on primitiveCLasses
      for type in @world.primitiveClasses
        
        switch type
          when 'Structure', 'Infantry'
            valign = 'bottom'
            halign = 'center'
          when 'Projectile'
            valign = 'middle'
            halign = 'center'
            
        for p in @world.Instances[type]
          x = p.x - @scroll.x
          if -@scroll.margin < x < atom.width + @scroll.margin
            atom.context.drawSprite(p.getName(), x, p.y, valign, halign)
      
      @mode.draw()
      @ui.minimap.draw()
        
    _drawBackground : (x = 0, y = 0) ->
      atom.context.putImageData(@backgroundImgData, x, y)