define ->
  (_atomContext) ->
    # Bolt-on for atom that draws from sprites on a spritesheet
    _atomContext.drawSprite = (name, x = 0, y = 0) ->
      # Assuming the spritesheet data lives in an global object called GFXINFO
      # and the loaded spritesheet lives in atom.gfx.spritesheet
      sprite = GFXINFO[name]
      
      @drawImage(
        atom.gfx.spritesheet,
        
        sprite.x,         sprite.y
        sprite.width,     sprite.height,
            
        x,                y,
        sprite.width,     sprite.height
      ) unless !sprite?