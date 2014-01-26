define ->
  
  MODE =
    SELECT_NONE  : 0
    SELECT_HOVER : 1
    ATTACK       : 1
    MOVE         : 2
    DEFEND       : 3
  
  class BattleUICursor
    MODE  : MODE    
    mode  : MODE.SELECT_NONE
    _text : null

    constructor : ->
      document.body.style.cursor = 'crosshair'

    switchCursor : (name) ->
      @mode = MODE[name]

    clearText : ->
      delete @_text
      
    setText : (textObj) ->
      @_text = textObj

    draw : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      # 16 = CURSOR_SPRITE_HEIGHT >> 1
      atom.context.drawText @_text.value, mx, my + 8, @_text.color, @_text.halign if @_text?
      # Using default cursors on desktop for now.
      # atom.context.drawSprite "cursor-#{@mode}", mx, my, 'middle', 'center'
