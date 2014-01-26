define [
  'core/Battle/UI'
  'core/UI/UIGroup'
  'core/UI/Button'
], (BattleUI, UIGroup, Button) ->
  
  class BattleUISidebar extends BattleUI
    w : 202

    COLOR_BACKGROUND  : 'rgb(36,36,36)'
    COLOR_FRAME       : 'rgb(88,88,88)'
    COLOR_FRAME_DARK  : 'rgb(60,60,60)'
         
    constructor : (params) ->
      @[k]  = v for k, v of params
      @resize()
      
    _setScrollButtons : (x, y) ->
      @SCROLLBUTTON =
        # 0 = left column, 0 = up button
        COL00 : new Button {
          x : x + 1
          y : y
          sprite_up   : 'sidebar-button-0-0'
          sprite_down : 'sidebar-button-0-1'
        }
        COL01 : new Button {
          x : x + 1
          y : atom.height - 30
          sprite_up   : 'sidebar-button-1-0'
          sprite_down : 'sidebar-button-1-1'
        }
        
        COL10 : new Button {
          x : x + 100 + 1
          y : y
          sprite_up   : 'sidebar-button-0-0'
          sprite_down : 'sidebar-button-0-1'
        }
        COL11 : new Button {
          x : x + 100 + 1
          y : atom.height - 30
          sprite_up   : 'sidebar-button-1-0'
          sprite_down : 'sidebar-button-1-1'
        }
      
    resize : ->
      delete @SCROLLBUTTON
      @h = atom.height
      @x = atom.width - @w
    
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
      
      if !(@SCROLLBUTTON?)
        @_setScrollButtons x, y
      else
        v.draw() for k, v of @SCROLLBUTTON
      
      atom.context.restore()
    
    tick : ->
      if @containsCursor()
        v.tick() for k, v of @SCROLLBUTTON
