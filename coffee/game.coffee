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
      # It can get really loud.
      # future: Cap the amplitude of the waveform in the mixer?
      atom.setVolume 0.5
      atom.input.bind(atom.button.LEFT,  'mouseleft')
      atom.input.bind(atom.button.RIGHT, 'mouseright')
      atom.input.bind(atom.key.W,        'keyW')
      atom.input.bind(atom.key.A,        'keyA')
      atom.input.bind(atom.key.S,        'keyS')
      atom.input.bind(atom.key.D,        'keyD')
        
    MODES : MODES

    switchMode : (name) ->
      @mode = new @MODES[name] { game : @ }
      
      # Resizing should resize UI elements.
      # This also stops the game from crashing.
      window.removeEventListener 'resize', @listener if @listener?
      @listener = @mode.resize.bind @mode
      window.addEventListener "resize", @listener, false
    
    update : ->
      @mode.tick()
      
    draw : ->
      atom.context.clear()
      @mode.draw()
      
    