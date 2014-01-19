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
      # register inputs
      atom.input.bind(atom.button.LEFT, 'mouseleft')
    
    MODES : MODES
      
    mode :
      _current : 'MainMenu'
        
    switchMode : (modeName) ->
      @mode[modeName] = new @MODES[modeName]
      @mode._current = modeName
    
    update : (dt) ->
      # 1. Run controller logic, game logic.
      modeSelf = @mode[@mode._current]
      modeSelf.tick(dt)
      
    draw : ->
      # 2. Update the UI.
      atom.context.clear()
      modeSelf = @mode[@mode._current]
      modeSelf.draw()
      
    