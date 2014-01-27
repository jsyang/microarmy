define [
  'core/BehaviorExecutor'
  'core/Battle/behaviors'
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
  
  'core/Battle/EVA'
  'core/Battle/Voices'
  'core/Battle/Player'
  
  'core/Battle/UI/minimap'
  'core/Battle/UI/cursor'
  'core/Battle/UI/sidebar'
  
  'core/Battle/mode/constructbase'
  'core/Battle/mode/commandpawn'
  'core/Battle/mode/spawnpawn'
], (BehaviorExecutor,
    BattleBehaviors,
    World,
    makeBackgroundImageData,
    
    BattleEVA,
    BattleVoices,
    BattlePlayer,
    
    BattleUIMinimap,
    BattleUICursor,
    BattleUISidebar,
    
    ConstructBase,
    CommandPawn,
    SpawnPawn) ->
  
  class Battle
    MODE : { # UI controller
      ConstructBase
      CommandPawn
      SpawnPawn
    }
        
    scroll :
      margin : 50 # if something is closer than this to the viewport, render it
      x : 0
      y : 0
    
    _drawBackground : (x = 0, y = 0) ->
      atom.context.putImageData(@backgroundImgData, x, y)
    
    resetMode : ->
      @switchMode 'CommandPawn'
    
    switchMode : (mode) ->
      @ui.cursor.clearText()
      @mode = new @MODE[mode] { battle : @ }
    
    resize : ->
      v.resize?() for k, v of @ui
      
    draw : ->
      @_drawBackground(-@scroll.x, -@scroll.y) # scroll position
      
      # Drawing order is based on primitiveCLasses
      for type in @world.primitiveClasses
        switch type
          when 'Structure', 'Infantry'
            valign = 'bottom'
            halign = 'center'
          when 'Projectile', 'Explosion'
            valign = 'middle'
            halign = 'center'
        
        for p in @world.Instances[type] when !p.isPendingRemoval()
          x = p.x - @scroll.x
          if -@scroll.margin < x < atom.width + @scroll.margin
            atom.context.drawSprite(p.getName(), x, p.y, valign, halign)
      
      @mode.draw?()
      @ui.minimap.draw()
      @ui.sidebar.draw()
      @ui.cursor.draw()

    tick : ->
      @EVA.tick()
      @mode.tick?()
      @ui.minimap.tick()
      @ui.sidebar.tick()
      @world.tick()
      
    constructor : (params) ->
      @[k] = v for k, v of params
      
      @world = new World { battle : @ }
      
      # background = sky + terrain layer, sits below the instances drawn layer
      @backgroundImgData = makeBackgroundImageData(@world)
      
      # BTree interpreter
      @behaviors = new BehaviorExecutor BattleBehaviors(@world, @world.Classes)
      
      @player = new BattlePlayer {
        team   : 0
        funds  : 2000
        battle : @
        starting_inventory : {
          # Base starter kit
          'CommCenter'        : 1
          #'CommRelay'         : 1
          #'WatchTower'        : 1
          #'AmmoDump'          : 1
          #'AmmoDumpSmall'     : 1
          'Pillbox'           : 1
          #'MineFieldSmall'    : 1
          # 'SmallTurret'       : 1
          #'MissileRack'       : 1
          # 'MissileRackSmall'  : 1 
          #'Scaffold'          : 1
          'Barracks'          : 1
          # 'Depot'
          # 'RepairYard'
          # 'Helipad'
        }
      }
      
      # Various UI components, must be init in order.
      uiParams = { battle : @ }
      @ui = {}
      @ui.sidebar = new BattleUISidebar uiParams
      @ui.minimap = new BattleUIMinimap uiParams
      @ui.cursor  = new BattleUICursor  uiParams

      @mode       = new @MODE.ConstructBase uiParams
      @EVA        = new BattleEVA
      @voices     = new BattleVoices