define ->
  (_atomContext) ->
    # Bolt-on for atom that draws from sprites on a spritesheet
    _atomContext.drawSprite = (name, x = 0, y = 0, valign = 'top', halign = 'left', opacity = 1) ->
      # Assuming the spritesheet data lives in an global object called GFXINFO
      # and the loaded spritesheet lives in atom.gfx.spritesheet
      sprite = GFXINFO[name]
      
      dx = 0
      dy = 0
      
      switch valign
        when 'middle'
          dy -= sprite.height >> 1
        when 'bottom'
          dy -= sprite.height
      
      switch halign
        when 'center'
          dx -= sprite.width >> 1
        when 'right'
          dx -= sprite.width
          
      # Set opacity
      if opacity != 1
        @save()
        @globalAlpha = opacity
      
      @drawImage(
        atom.gfx.spritesheet,
        
        sprite.x,         sprite.y
        sprite.width,     sprite.height,
            
        x + dx,           y + dy,
        sprite.width,     sprite.height
      ) unless !sprite?
      
      # Restore opacity
      if opacity != 1
        @restore()