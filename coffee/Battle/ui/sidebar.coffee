define ->
  
  class BattleUISidebar
    x : 0
    y : 0
    w : 202

    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    COLOR_BACKGROUND  : 'rgb(36,36,36)'
    COLOR_FRAME       : 'rgb(88,88,88)'
    COLOR_FRAME_DARK  : 'rgb(60,60,60)'
        
    constructor : (params) ->
      @[k]  = v for k, v of params
      window.p = @

    messages     : []
    messages_max : 6
    
    addMessage : (m) ->
      @messages.push m
      @messages.shift() if @messages.length > @messages_max
      
    draw : ->
      x = atom.width - @w
      y = @y
      
      atom.context.save()
      atom.context.fillStyle = @COLOR_BACKGROUND
      atom.context.fillRect x, y, @w, atom.height
      
      # FUNDS
      atom.context.fillStyle = @COLOR_FRAME
      atom.context.fillRect x + 1, y, @w - 2, atom.context.drawText.lineHeight
      atom.context.drawText "FUNDS : #{@battle.funds}", x + 2, y, '#fff'
      y += atom.context.drawText.lineHeight + 1
      
      # MESSAGES HEADER
      atom.context.drawText "MESSAGES", x + 2, y, '#ccc'
      y += atom.context.drawText.lineHeight + 1
      
      # MESSAGES BODY
      atom.context.fillStyle = @COLOR_FRAME_DARK
      bodyHeight = atom.context.drawText.lineHeight * @messages_max
      atom.context.fillRect x + 1, y, @w - 2, bodyHeight
      atom.context.drawText @messages, x + 2, y, '#eee'
      y += bodyHeight + 1
      
      # CONSTRUCTION HEADER      
      atom.context.fillStyle = @COLOR_FRAME
      atom.context.fillRect x + 1, y, @w - 2, atom.context.drawText.lineHeight
      atom.context.drawText "CONSTRUCTION COMMANDS", x + 2, y, '#fff'
      y += atom.context.drawText.lineHeight + 1
      
      # CONSTRUCTION BODY
      atom.context.fillStyle = @COLOR_FRAME_DARK
      atom.context.fillRect x + 1, y, @w - 2, atom.height - y - 1
      
      atom.context.restore()