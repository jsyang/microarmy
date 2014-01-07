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
      
    update : (dt) ->
      modeSelf = @mode[@mode._current]
      modeSelf.tick(dt)
    
    MODES : MODES
      
    mode :
      _current : 'MainMenu'
        
    switchMode : (modeName) ->
      @mode[modeName] = new @MODES[modeName]
      @mode._current = modeName
      
    draw : ->
      atom.context.clear()
      modeSelf = @mode[@mode._current]
      modeSelf.draw()
