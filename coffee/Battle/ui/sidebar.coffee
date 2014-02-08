define [
  'core/Battle/UI'
  'core/UI/UIGroup'
  'core/UI/Button'
  'core/Battle/UI/Sidebar.Context'
], (BattleUI, UIGroup, Button, addContextButtons) ->
  
  class BattleUISidebar extends BattleUI
    w : 202
    col0_scroll : 0
    col1_scroll : 0
    col0_scroll_max : 0
    col1_scroll_max : 0
    
    context_header : 'Nothing selected.'

    COLOR_BACKGROUND  : 'rgb(36,36,36)'
    COLOR_FRAME       : 'rgb(88,88,88)'
    COLOR_FRAME_DARK  : 'rgb(60,60,60)'
    
    _setContextButtons : (x, y) ->     
      switch @context
        when 'StructureSelected', 'UnitsSelected'
          CANCEL = new Button {
            x : x
            y
            sprite_up   : 'sidebar-button-cancel-0'
            sprite_down : 'sidebar-button-cancel-1'
            over        : @_getTooltipFunction 'Cancel selection'
            out         : => @battle.ui.cursor.clearText()
            pressed     : =>
              @battle.resetMode()
              @battle.ui.sound.INVALID()
          }
          @CONTEXTBUTTONS = [
            CANCEL
          ]
        when 'ConstructBase'
          SWITCHDIRECTION = new Button {
            x : x
            y
            sprite_up   : 'sidebar-button-direction-0'
            sprite_down : 'sidebar-button-direction-1'
            over        : @_getTooltipFunction 'Reverse build direction'
            out         : => @battle.ui.cursor.clearText()
            pressed     : =>
              @battle.mode.direction++
              @battle.mode.direction %= 2
              @battle.ui.sound.SWITCH_DIRECTION()
          }
          x += 50
          CANCEL = new Button {
            x : x
            y
            sprite_up   : 'sidebar-button-cancel-0'
            sprite_down : 'sidebar-button-cancel-1'
            over        : @_getTooltipFunction 'Cancel build'
            out         : => @battle.ui.cursor.clearText()
            pressed     : =>
              @battle.resetMode()
              @battle.ui.sound.INVALID()
          }
          @CONTEXTBUTTONS = [
            SWITCHDIRECTION
            CANCEL
          ]
      return
    
    setContext : (header, context) ->
      @clearContext()
      @context_header = header
      @context        = context
    
    clearContext : ->
      delete @CONTEXTBUTTONS
      delete @context
      @context_header = 'Nothing selected.'
    
    _setScrollButtons : (x, y) ->
      @SCROLLBUTTON =
        # 0 = left column, 0 = up button
        COL00 : new Button {
          x : x + 1
          y : y
          sprite_up   : 'sidebar-button-0-0'
          sprite_down : 'sidebar-button-0-1'
          pressed     : =>
            @col0_scroll--
            @col0_scroll = 0 if @col0_scroll < 0
            @updateBuildButtons true
        }
        COL01 : new Button {
          x : x + 1
          y : atom.height - 30
          sprite_up   : 'sidebar-button-1-0'
          sprite_down : 'sidebar-button-1-1'
          pressed     : =>
            @col0_scroll++
            @col0_scroll = @col0_scroll_max if @col0_scroll > @col0_scroll_max
            @updateBuildButtons true
        }
        
        COL10 : new Button {
          x : x + 100 + 1
          y : y
          sprite_up   : 'sidebar-button-0-0'
          sprite_down : 'sidebar-button-0-1'
          pressed     : =>
            @col1_scroll--
            @col1_scroll = 0 if @col1_scroll < 0
            @updateBuildButtons true
        }
        COL11 : new Button {
          x : x + 100 + 1
          y : atom.height - 30
          sprite_up   : 'sidebar-button-1-0'
          sprite_down : 'sidebar-button-1-1'
          pressed     : =>
            @col1_scroll++
            @col1_scroll = @col1_scroll_max if @col1_scroll > @col1_scroll_max
            @updateBuildButtons true
        }
    
    _getItemAttributes : (type) ->
      typeClass = @battle.world.Classes[type]
      {
        name        : typeClass::NAMETEXT
        cost        : @player.buildsystem.getCost type
        isStructure : typeClass.__super__.constructor.name is 'Structure'
      }
    
    _getBuildFunction : (type, isStructure) ->
      if isStructure
        build = (_type) ->
          if @player.canBuyPawnName _type
            @battle.switchMode 'ConstructBase', {
              build_structure : true
              build_structure_type : _type
            }
          else
            @battle.EVA.INSUFFICIENT_FUNDS()
        build = build.bind @, type
      else
        build = @player.build.bind @player, type
      build
        
    _getTooltipFunction : (tooltipText) ->
      ((text) ->
        @setText {
          value  : text
          halign : 'center'
          color  : '#000'
        }).bind @battle.ui.cursor, tooltipText
    
    # How far can we scroll down in the construction options buttons?
    _getMaxColScroll : (col) ->
      buildable_type = ['structures', 'units'][col]
      buildable_list = @player["buildable_#{buildable_type}"]
      # Constant.
      y  = 3 * (atom.context.drawText.lineHeight + 1) + 50 + 30
      y_max = atom.height - 30
      col_max_scroll = 0
      for type, numberOfFactories of buildable_list
        if @battle.player.tech_level >= @battle.world.Classes[type]::tech_level
          y += 100
          col_max_scroll++ if y > y_max
      col_max_scroll
    
    _setColButtons : (x, y, col) ->
      @["COL#{col}BUTTONS"] = []
      buildable_type = ['structures', 'units'][col]
      buildable_list = @player["buildable_#{buildable_type}"]
      
      button_index = 0
      
      for type, numberOfFactories of buildable_list
        if @player.tech_level >= @battle.world.Classes[type]::tech_level
          if button_index < @["col#{col}_scroll"]
            button_index++
            continue
          
          attr = @_getItemAttributes type
          button = new Button {
            type
            x
            y
            player       : @player
            sprite_up    : "sidebar-button-#{type.toLowerCase()}-0"
            sprite_down  : "sidebar-button-#{type.toLowerCase()}-1"
            pressed      : @_getBuildFunction type, attr.isStructure
            pressedR     : -> @player.buildsystem.removeFromQueue @type
            over         : @_getTooltipFunction "#{attr.name} ($#{attr.cost})"
            out          : => @battle.ui.cursor.clearText()
            draw         : ->
              @constructor::draw.call @
              queued = @player.buildsystem.queue[@type]
              atom.context.drawText queued, @x + @w, @y, '#f00', 'right' if queued?
          }
          button_index++
          y += 100
          @["COL#{col}BUTTONS"].push button
    
    updateBuildButtons : (noScrollReset) ->
      delete @COL0BUTTONS
      delete @COL1BUTTONS
      # Only update the build buttons, do not reset our scroll position
      unless noScrollReset
        @col0_scroll = 0
        @col1_scroll = 0
      @col0_scroll_max = @_getMaxColScroll 0
      @col1_scroll_max = @_getMaxColScroll 1
    
    resize : ->
      delete @CONTEXTBUTTONS
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
      if @player?
        atom.context.fillStyle = @COLOR_FRAME
        atom.context.fillRect x + 1, y, @w - 2, atom.context.drawText.lineHeight
        atom.context.drawText "FUNDS : #{@player.funds}", x + 2, y, '#fff'
      y += atom.context.drawText.lineHeight + 1
      
      # CONTEXT HEADER
      atom.context.drawText @context_header, x + 2, y, '#ccc'
      y += atom.context.drawText.lineHeight + 1
      
      # CONTEXT ACTIONS
      atom.context.fillStyle = @COLOR_FRAME_DARK
      atom.context.fillRect x + 1, y, @w - 2, 50
      if @context? and !(@CONTEXTBUTTONS?)
        @_setContextButtons x + 1, y
      else
        v.draw() for v in @CONTEXTBUTTONS if @CONTEXTBUTTONS?
      y += 50 + 1
      
      # CONSTRUCTION HEADER      
      atom.context.fillStyle = @COLOR_FRAME
      atom.context.fillRect x + 1, y, @w - 2, atom.context.drawText.lineHeight
      atom.context.drawText "CONSTRUCTION OPTIONS", x + 2, y, '#fff'
      y += atom.context.drawText.lineHeight + 1
      
      # CONSTRUCTION BODY
      atom.context.fillStyle = @COLOR_FRAME_DARK
      atom.context.fillRect x + 1, y, @w - 2, atom.height - y - 1
      
      # SCROLL BUTTONS
      unless @SCROLLBUTTON?
        @_setScrollButtons x, y
      y += @SCROLLBUTTON.COL00.h
      
      # CONSTRUCTION OPTION BUTTONS
      unless @COL0BUTTONS? and @COL1BUTTONS?
        @_setColButtons x + 1, y, 0
        @_setColButtons x + 100 + 1, y, 1
      v.draw() for v in @COL0BUTTONS if @COL0BUTTONS?
      v.draw() for v in @COL1BUTTONS if @COL1BUTTONS?
      
      # Scroll buttons must be drawn on top of the build options.
      v.draw() for k, v of @SCROLLBUTTON if @SCROLLBUTTON?
      
      atom.context.restore()
    
    tick : ->
      if @containsCursor()
        scrollButtonsTicked = false
        scrollButtonsTicked ||= v.tick() for k, v of @SCROLLBUTTON
        if not scrollButtonsTicked
          v.tick() for v    in @COL0BUTTONS if @COL0BUTTONS?
          v.tick() for v    in @COL1BUTTONS if @COL1BUTTONS?
        v.tick() for v    in @CONTEXTBUTTONS if @CONTEXTBUTTONS?
        true
      else
        false

    constructor : (params) ->
      @[k]  = v for k, v of params
      @player = @battle.player
      @resize()
      @clearContext()
