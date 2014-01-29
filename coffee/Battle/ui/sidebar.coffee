define [
  'core/Battle/UI'
  'core/UI/UIGroup'
  'core/UI/Button'
], (BattleUI, UIGroup, Button) ->
  
  class BattleUISidebar extends BattleUI
    w : 202

    messages     : []
    messages_max : 6

    COLOR_BACKGROUND  : 'rgb(36,36,36)'
    COLOR_FRAME       : 'rgb(88,88,88)'
    COLOR_FRAME_DARK  : 'rgb(60,60,60)'
         
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
    
    _setColButtons : (x, y, col) ->
      @["COL#{col}BUTTONS"] = []
      buildable_type = ['structures', 'units'][col]
      buildable_list = @battle.player["buildable_#{buildable_type}"]
      if buildable_list.length
        for type in buildable_list
          typeClass = @battle.world.Classes[type]
          name = typeClass::NAMETEXT
          cost = typeClass::COST
          isStructure = typeClass.__super__.constructor.name is 'Structure'
          
          # todo: This is probably a really horrible way to go about it, come up with something better later.
          # Add the cost of sending an Engineer from the CommCenter
          if isStructure
            cost += @battle.world.Classes.EngineerInfantry::COST
            buildFunction = (type, _battle) ->
              @state = 'down'
              _battle.switchMode 'ConstructBase', {
                build_structure : true
                build_structure_type : type
              }
          else
            buildFunction = @battle.player.build.bind @battle.player, type
            
          button = new Button {
            x
            y
            sprite_up   : "sidebar-button-#{type.toLowerCase()}-0"
            sprite_down : "sidebar-button-#{type.toLowerCase()}-1"
            pressed     : buildFunction
            over : ((name, cost) ->
              @setText {
                value  : "#{name} ($#{cost})"
                halign : 'center'
                color  : '#000'
              }).bind @battle.ui.cursor, name, cost
            out : =>
              @battle.ui.cursor.clearText()
          }
          
          # Build mode, click again to select location.
          if isStructure
            button.pressed = button.pressed.bind button, type, @battle
            
          y += 100
          @["COL#{col}BUTTONS"].push button
    
    updateBuildButtons : ->
      delete @COL0BUTTONS
      delete @COL1BUTTONS
    
    addMessage : (m) ->
      @messages.push m
      @messages.shift() if @messages.length > @messages_max
    
    resize : ->
      delete @SCROLLBUTTON
      delete @COL0BUTTONS
      delete @COL1BUTTONS
      @h = atom.height
      @x = atom.width - @w
    
    draw : ->
      x = atom.width - @w
      y = @y
      
      atom.context.save()
      atom.context.fillStyle = @COLOR_BACKGROUND
      atom.context.fillRect x, y, @w, atom.height
      
      # FUNDS
      if @battle.player?
        atom.context.fillStyle = @COLOR_FRAME
        atom.context.fillRect x + 1, y, @w - 2, atom.context.drawText.lineHeight
        atom.context.drawText "FUNDS : #{@battle.player.funds}", x + 2, y, '#fff'
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
      
      # SCROLL BUTTONS
      unless @SCROLLBUTTON?
        @_setScrollButtons x, y
      v.draw() for k, v of @SCROLLBUTTON
      y += @SCROLLBUTTON.COL00.h
      
      # CONSTRUCTION OPTION BUTTONS
      unless @COL0BUTTONS? and @COL1BUTTONS?
        @_setColButtons x + 1, y, 0
        @_setColButtons x + 100 + 1, y, 1
      v.draw() for v in @COL0BUTTONS
      v.draw() for v in @COL1BUTTONS
        
      atom.context.restore()
    
    tick : ->
      if @containsCursor()
        v.tick() for k, v of @SCROLLBUTTON
        v.tick() for v    in @COL0BUTTONS
        v.tick() for v    in @COL1BUTTONS
        true
      else
        false

    constructor : (params) ->
      @[k]  = v for k, v of params
      @resize()