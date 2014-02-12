define [
  'core/UI/Button'
], (Button) ->
  
  (SideBar) ->
    extender =
      context_header : 'Nothing selected.'
      
      _setContextButtons : (x, y) ->     
        switch @context
          when 'StructureSelected'
            @CONTEXTBUTTONS = []
            if @battle.mode.structure.buildable_primitives?
              PRIMARIFY = new Button {
                x
                y
                sprite_up   : 'sidebar-button-primarify-0'
                sprite_down : 'sidebar-button-primarify-1'
                over        : @_getTooltipFunction 'Assign as primary build location'
                out         : => @battle.ui.cursor.clearText()
                pressed     : =>
                  selected = @battle.mode.structure
                  for type in selected.buildable_primitives
                    i = @battle.player.factory[type].indexOf selected
                    @battle.player.factory[type].splice i, 1
                    @battle.player.factory[type].unshift selected
                  @battle.ui.sound.CLICK_SET()
              }
              @CONTEXTBUTTONS.push PRIMARIFY
              x += 50
              
            CANCEL = new Button {
              x
              y
              sprite_up   : 'sidebar-button-cancel-0'
              sprite_down : 'sidebar-button-cancel-1'
              over        : @_getTooltipFunction 'Cancel selection'
              out         : => @battle.ui.cursor.clearText()
              pressed     : =>
                @battle.resetMode()
                @battle.ui.sound.INVALID()
            }
            @CONTEXTBUTTONS.push CANCEL
          
          when 'UnitsSelected'
            CANCEL = new Button {
              x
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
              x
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
              x
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
    
    SideBar[k] = v for k,v of extender