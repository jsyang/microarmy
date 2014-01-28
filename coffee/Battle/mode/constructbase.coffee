define ['core/Battle/UI'], (BattleUI) ->
  # Initial base construction as well as structure construction location select.
  class ConstructBase extends BattleUI   
    direction : 0
    
    LOCATIONVALIDTHRESHOLD : 0.35
    
    _getSpriteName : ->
      if not @temp_instance?
        @temp_instance = new @battle.world.Classes[@cart] {
          team      : @team
          direction : @direction
        }
      else
        @temp_instance.direction = @direction
      @temp_instance.getName()
        
    _checkIfLocationValid : ->
      x = @battle.scroll.x + atom.input.mouse.x
      name = @_getSpriteName()
      w = GFXINFO[name].width
      w2 = w >> 1
      numberOfDifferentHeights = 0
      baseline = @battle.world.height x
      for i in [x - w2 .. x + w2]
        if @battle.world.height(i) != baseline
          numberOfDifferentHeights++
      w * @LOCATIONVALIDTHRESHOLD > numberOfDifferentHeights
    
    _cullInventory : (entity) ->
      @inventory[entity]-- if @inventory[entity]?
      delete @inventory[entity] if @inventory[entity] is 0
      delete @temp_instance
      return @cart = k for k, v of @inventory
      @_constructionComplete()
      
    _constructionComplete : ->
      @battle.resetMode()
    
    _addInventoryToWorld : ->
      atom.playSound 'dropitem'
      x = atom.input.mouse.x + @battle.scroll.x
      entity = new @battle.world.Classes['Scaffold'] {
        build_type : @cart
        x          : x
        y          : @battle.world.height(x)
        team       : @team
        direction  : @direction
      }
      @battle.world.add entity
      @battle.player.addEntity entity
    
    _setBuildLocationToCursor : ->
      @battle.player.sendEngineerToBuildStructure @build_structure_type, atom.input.mouse.x + @battle.scroll.x
      
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
    
    draw : ->
      if @containsCursor()
        if @cart?
          mx = atom.input.mouse.x
          my = atom.input.mouse.y
          
          spriteName = @_getSpriteName()
          isLocationValid = @_checkIfLocationValid()        
          if isLocationValid
            opacity   = 0.6
            @battle.ui.cursor.setText {
              value  : "Right click to change direction."
              color  : "#555555"
              halign : 'center'
            }
          else
            opacity = 0.3
            @battle.ui.cursor.setText {
              value  : "Cannot build here!"
              color  : "#ff0000"
              halign : 'center'
            }
          atom.context.drawSprite spriteName, mx, @battle.world.height(mx + @battle.scroll.x), 'bottom', 'center', opacity
      else
        @battle.ui.cursor.clearText()
    
    tick : ->
      if @containsCursor()
        if atom.input.pressed('mouseright')
          if @direction is 0
            @direction = 1
          else
            @direction = 0
          
        if atom.input.pressed('mouseleft')
          if @_checkIfLocationValid()
            if @build_structure
              @_setBuildLocationToCursor()
              @_constructionComplete()
            else
              @_addInventoryToWorld()
              @_cullInventory @cart
          else
            atom.playSound 'invalid'

    constructor : (params) ->
      @[k]  = v for k, v of params
      @team = @battle.player.team
      if @build_structure
        @battle.EVA.add 'v_selectlocationtobuildstructures'
        @cart = @build_structure_type
      else
        @inventory = @battle.player.starting_inventory
        @_cullInventory()
      @resize()
      