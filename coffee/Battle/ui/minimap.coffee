define ['core/Battle/UI'], (BattleUI) ->
  
  class BattleUIMiniMap extends BattleUI
    x : 0
    y : 500
    scale : 2
    
    constructor : (params) ->
      @[k] = v for k, v of params
      @_generateMinimapImageData()
    
    # Minimap analog of battlefield.
    # Background image with sky and terrain.
    _generateMinimapImageData : ->
      w = @world.w >> @scale
      h = @world.h >> @scale
      [@mapw, @maph] = [w, h]
        
      # future: if the map is larger than our
      # max size for the minimap component, we'll need to cull the view
      [@w, @h] = [w, h]
      
      @_backgroundImgData = atom.context.createImageData(w, h)
      d = @_backgroundImgData.data
      
      c_darkgreen =
        r : 49
        g : 84
        b : 76
      
      c_dark =
        r : 30
        g : 30
        b : 30
      
      for x in [0...w]
        height = @world.height(x<<@scale) >> @scale
        
        for y in [0...h]
          if y > height
            color = c_darkgreen
          else
            color = c_dark
          
          # Pixel index
          c = (y*w + x) << 2
          
          # Set the minimap color
          d[c+0] = color.r
          d[c+1] = color.g
          d[c+2] = color.b
          d[c+3] = 0xFF
      
    draw : ->
      atom.context.putImageData(@_backgroundImgData, @x, @y)
      @_drawHighlight()
    
    # Box to show where player is looking at, in relation to battlefield
    _drawHighlight : ->
      atom.context.save()
      atom.context.lineWidth = '1'
      atom.context.strokeStyle = 'rgb(144,245,93)'
      x = (@world.battle.scroll.x>>@scale) + 0.5
      y = (@world.battle.scroll.y>>@scale) + 0.5
      w = (atom.width>>@scale)
      
      atom.context.strokeRect(@x + x, @y + y, w, @h-1)
      atom.context.restore()
    
    tick : ->
      # bug: dragging the cursor from the battle view into the minimap will scroll the minimap!
      if @containsCursor() and atom.input.down('mouseleft')
        viewMargin = atom.width >> (@scale+1)
        x = atom.input.mouse.x - @x - viewMargin
        x = 0 if x < 0
        x = @w - (viewMargin<<1) if x + (viewMargin<<1) > @w
        @world.battle.scroll.x = x << @scale
