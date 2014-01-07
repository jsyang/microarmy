define ->
  (_atomContext) ->
    # Assuming the spritesheet data lives in an global object called GFXINFO
    # and the loaded spritesheet lives in atom.gfx.spritesheet
    _atomContext.drawSprite = (name, x=0, y=0) ->
      sprite = GFXINFO[name]
      @drawImage(
        atom.gfx.spritesheet,
        sprite.x,     sprite.y
        sprite.width, sprite.height,
        
        x,       y,
        sprite.width, sprite.height
      )