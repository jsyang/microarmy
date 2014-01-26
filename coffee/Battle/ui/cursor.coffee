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
    text : null

    _setColors : (team) ->
      @body_color = [
        'rgb(211,220,235)'
        'rgb(212,235,211)'
      ][team]

    constructor : (params) ->
      @[k] = v for k, v of params
      document.body.style.cursor = 'crosshair'
      @_setColors @battle.team

    switchCursor : (name) ->
      @mode = MODE[name]

    clearText : ->
      delete @text
      
    setText : (textObj) ->
      if !(textObj.value instanceof Array)
        textObj.value = [textObj.value]
      @text = textObj

    _getBoxWidth : ->
      length = 0
      for l in @text.value when l.length > length
        longestLine = l
      atom.context.measureText(longestLine).width

    draw : ->
      if @text?
        x = atom.input.mouse.x
        y = atom.input.mouse.y + 8
        
        w = @_getBoxWidth() + 4
        w2 = w >> 1
        h = @text.value.length * atom.context.drawText.lineHeight + 2
        
        
        atom.context.save()
        atom.context.fillStyle = '#000'
        atom.context.fillRect x - w2, y, w, h
        
        atom.context.fillStyle = @body_color
        atom.context.fillRect x - w2 + 1, y + 1, w - 2, h - 2
        
        atom.context.drawText @text.value, x, y, @text.color, @text.halign
        atom.context.restore()

        # Using default cursors on desktop for now.
        #atom.context.drawSprite "cursor-#{@mode}", mx, my, 'middle', 'center'
