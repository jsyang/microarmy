define [
  'core/BehaviorExecutor'
  'core/Battle/behaviors'
  'core/Battle/Mission'
  
  'core/Battle/World'
  'core/Battle/makeBackgroundImageData'
  
  'core/Battle/EVA'
  'core/Battle/Voices'
  'core/Battle/Player'
  'core/Battle/Player.AI'
  
  'core/Battle/UI/minimap'
  'core/Battle/UI/cursor'
  'core/Battle/UI/sidebar'
  'core/Battle/UI/Sound'
  
  'core/Battle/mode/constructbase'
  'core/Battle/mode/commandpawn'
  #'core/Battle/mode/spawnpawn'
], (BehaviorExecutor,
    BattleBehaviors,
    BattleMission,
    
    World,
    makeBackgroundImageData,
    
    BattleEVA,
    BattleVoices,
    BattlePlayer,
    BattlePlayerAI,
    
    BattleUIMinimap,
    BattleUICursor,
    BattleUISidebar,
    BattleUISound,
    
    ConstructBase,
    CommandPawn
    #SpawnPawn
) ->
  
  class Battle
    MODE : { # UI controller
      ConstructBase
      CommandPawn
      #SpawnPawn
    }
        
    scroll :
      margin : 50 # if something is closer than this to the viewport, render it
      x : 0
      y : 0
        
    resetMode : ->
      @ui.sidebar.clearContext()
      @switchMode 'CommandPawn'
    
    switchMode : (mode, params) ->
      @ui.cursor.clearText()
      modeParams = { battle : @ }
      if params?
        modeParams[k] = v for k, v of params
      @mode = new @MODE[mode] modeParams
    
    resize : ->
      v.resize?() for k, v of @ui
      
    draw : ->
      atom.context.putImageData @backgroundImgData, -@scroll.x, -@scroll.y
      
      # Drawing order is based on primitiveCLasses
      for type in @world.primitiveClasses
        switch type
          when 'Structure', 'Infantry', 'Prop'
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
      @player.buildsystem.tick()
      @enemy?.tick()
      @EVA.tick()
      @mode.tick?()
      @mission?.tick()
      @ui.minimap.tick()
      @ui.sidebar.tick()
      @world.tick()
      
    constructor : (params) ->
      @[k] = v for k, v of params
      
      @world = new World { battle : @ }
      
      # background = sky + terrain layer, sits below the instances drawn layer
      @backgroundImgData = makeBackgroundImageData(@world)
      
      @behaviors = new BehaviorExecutor BattleBehaviors(@world, @world.Classes)
      
      # Factions
      @player = new BattlePlayer {
        team   : 0
        funds  : 20000
        battle : @
        starting_inventory : {
          # Base starter kit
          'CommCenter' : 1
        }
      }
      
      @enemy = new BattlePlayerAI {
        team     : 1
        funds    : 15000
        battle   : @
        commands : [
          'CONSTRUCT_INITIAL_BASE'
        ]
        starting_inventory : {
          'CommCenter' : 1
          'MissileRack' : 1
          'MissileRackSmall' : 2
          'Barracks' : 1
        }
      }
      
      # UI components, must be init in order.
      uiParams = { battle : @ }
      @ui = {}
      @ui.sidebar = new BattleUISidebar uiParams
      @ui.minimap = new BattleUIMinimap uiParams
      @ui.cursor  = new BattleUICursor  uiParams
      @ui.sound   = new BattleUISound   uiParams

      # Misc Battle controller stuff
      @EVA        = new BattleEVA
      @voices     = new BattleVoices
      @mission    = new BattleMission {
        battle : @
        win : [
          'EXTERMINATE'
        ]
        lose : [
          'ALL_UNITS_AND_STRUCTURES_DESTROYED'
          'COMMCENTER_DESTROYED'
        ]
      }
      @mode       = new @MODE.ConstructBase {
        battle : @
        cb     : @mission.start.bind @mission
      }
      