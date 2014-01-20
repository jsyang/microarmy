define [
  'core/Battle'
  'core/UI/MainMenu'
], (Battle, MainMenu) ->
  
  MODES = {
    Battle
    MainMenu
    #BattleParams
  }
  
  class MicroarmyGame extends atom.Game
    
    constructor : ->
      atom.input.bind(atom.button.LEFT, 'mouseleft')
    
    MODES : MODES
      
    # mode : {}
        
    switchMode : (name) ->
      @mode = new @MODES[name] { game : @ }
    
    update : (dt) ->
      @mode.tick(dt)
      
    draw : ->
      atom.context.clear()
      @mode.draw()
      
    