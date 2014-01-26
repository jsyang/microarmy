define ['core/Battle/UI'], (BattleUI) ->
  
  class BattleUIMiniMap extends BattleUI
    x : 0
    y : 500
    
    COLOR_HIGHLIGHT : 'rgb(144,245,93)'
    
    isDragging : false
    
    constructor : (params) ->
      @[k] = v for k, v of params
      @resize()
      
    
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = atom.height - @battle.world.h
      @w2 = @w * 0.5
      # Multipliers to convert Battle world coords to minimap coords
      @scaleW   = @w / @battle.world.w
      @scaleH   = @h / @battle.world.h
      @_1scaleW = 1 / @scaleW
      @_1scaleH = 1 / @scaleH
      @highlightW = @w * @scaleW
      @_generateMinimapImageData()
      
    # Minimap analog of battlefield.
    _generateMinimapImageData : ->
      # future: if the map is larger than our
      # max size for the minimap component, we'll need to cull the view
      w = @w >> 0
      h = @h >> 0
      
      # todo : split this up into 2 drawn layers, fogged areas and radar penetrating areas
      # We cannot see all enemies on the minimap.
      @BACKGROUNDIMAGEDATA = atom.context.createImageData(w, h)
      d = @BACKGROUNDIMAGEDATA.data
      
      c_darkgreen =
        r : 49
        g : 84
        b : 76
      
      c_dark =
        r : 40
        g : 40
        b : 40
      
      for x in [0...w]
        height = @battle.world.height(x * @_1scaleW) * @scaleH
        
        for y in [0...h]
          if y > height
            color = c_darkgreen
          else
            color = c_dark
          
          # Pixel index
          c = (y * w + x) << 2
          
          # Set the minimap color
          d[c+0] = color.r
          d[c+1] = color.g
          d[c+2] = color.b
          d[c+3] = 0xFF
      
    draw : ->
      atom.context.putImageData(@BACKGROUNDIMAGEDATA, @x, @y)
      @_drawHighlight()
    
    # Box to show where player is looking at, in relation to battlefield
    _drawHighlight : ->
      atom.context.save()
      atom.context.lineWidth = '1'
      atom.context.strokeStyle = @COLOR_HIGHLIGHT
      x = @battle.scroll.x * @scaleW
      y = @battle.scroll.y * @scaleH
      x = (x >> 0) + 0.5
      y = (y >> 0) + 0.5
      w = (atom.width - @battle.ui.sidebar.w) * @scaleW
      w >>= 0
      
      atom.context.strokeRect(@x + x, @y + y, w, @h - 1)
      atom.context.restore()
    
    _scrollBattleView : ->
      highlightW2 = @highlightW * 0.5
      x = atom.input.mouse.x - @x - highlightW2
      x = 0 if x < 0
      x = @w - @highlightW if x > @w - @highlightW
      newScrollX = (x * @_1scaleW) >> 0 
      @battle.scroll.x = newScrollX
    
    tick : ->
      if @containsCursor()
        if atom.input.down 'mouseleft'
          if @isDragging
            @_scrollBattleView()
          else
            if atom.input.pressed 'mouseleft'
              @isDragging = true
      else
        @isDragging = false
    