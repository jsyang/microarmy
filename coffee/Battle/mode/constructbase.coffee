define ['core/Battle/UI'], (BattleUI) ->
  # Initial base construction as well as structure construction location select.
  class ConstructBase extends BattleUI   
    direction : 0
    
    LOCATIONVALIDTHRESHOLD : 0.35
    
    CURSORTEXT_INVALID :
      value  : "Cannot build here!"
      color  : "#ff0000"
      halign : 'center'
    
    CURSORTEXT_VALID :
      value  : "Right click to change direction."
      color  : "#555555"
      halign : 'center'
      
      
    _updateTempInstance : ->
      @temp_instance = new @battle.world.Classes[@cart] {
        team      : @team
        direction : @direction
      }
      
    _getSpriteName : ->
      @temp_instance.direction = @direction
      @temp_instance.getName()
    
    checkLocationEmptyOfExistingStructure : (x) ->
      for s in @battle.world.Instances.Structure
        if s instanceof @battle.world.Classes.Scaffold
          temp_instance = new @battle.world.Classes[s.build_type]
          w2 = temp_instance._halfWidth
        else
          w2 = s._halfWidth
        if s.x - w2 <= x <= s.x + w2
          return false
        else
          return true
      return true
    
    checkLocationTerrain : (x, temp_instance = @temp_instance) ->
      name = temp_instance.getName()
      w2 = temp_instance._halfWidth
      numberOfDifferentHeights = 0
      baseline = @battle.world.height x
      for i in [x - w2 .. x + w2]
        if @battle.world.height(i) != baseline
          numberOfDifferentHeights++
      2 * w2 * @LOCATIONVALIDTHRESHOLD > numberOfDifferentHeights
    
    _cullInventory : (entity) ->
      @inventory[entity]-- if @inventory[entity]?
      delete @inventory[entity] if @inventory[entity] is 0
      delete @temp_instance
      for k, v of @inventory
        @cart = k
        @_updateTempInstance()
        return
      @_constructionComplete()
      
    _constructionComplete : ->
      @battle.resetMode()
      @cb?()
    
    addEntityToWorld : (type, x) ->
      @battle.ui.sound.ADD_SCAFFOLD()
      entity = new @battle.world.Classes['Scaffold'] {
        build_type : type
        x          : x
        y          : @battle.world.height x
        team       : @team
        direction  : @direction
      }
      @battle.world.add entity
      entity
    
    _addInventoryToWorld : ->
      entity = @addEntityToWorld @cart, atom.input.mouse.x + @battle.scroll.x
      @battle.player.addEntity entity
    
    _setBuildLocationToCursor : ->
      @battle.player.build(
        @build_structure_type,
        atom.input.mouse.x + @battle.scroll.x,
        @direction,
        true
      )
    
    _checkCursorLocationValidBuild : ->
      x = atom.input.mouse.x + @battle.scroll.x
      @checkLocationTerrain(x) and @checkLocationEmptyOfExistingStructure(x)
          
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
    
    draw : ->
      if @containsCursor()
        if @cart?
          if @_checkCursorLocationValidBuild()
            opacity = 0.6
            @battle.ui.cursor.setText @CURSORTEXT_VALID
          else
            opacity = 0.3
            @battle.ui.cursor.setText @CURSORTEXT_INVALID
          mx = atom.input.mouse.x
          x = mx + @battle.scroll.x
          atom.context.drawSprite @_getSpriteName(), mx, @battle.world.height(x), 'bottom', 'center', opacity
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
          if @_checkCursorLocationValidBuild()
            if @build_structure
              @_setBuildLocationToCursor()
              @_constructionComplete()
            else
              @_addInventoryToWorld()
              @_cullInventory @cart
          else
            @EVA.CANNOT_BUILD_HERE()

    constructor : (params) ->
      @[k]  = v for k, v of params
      @team = @battle.player.team
      @EVA  = @battle.EVA
      
      if @build_structure
        @cart = @build_structure_type
        @_updateTempInstance()
        @EVA.SELECT_BUILD_LOCATION()
      else
        @inventory = @battle.player.starting_inventory
        @_cullInventory()
        @EVA.INITIAL_BASE_CONSTRUCTION()

      @resize()
      