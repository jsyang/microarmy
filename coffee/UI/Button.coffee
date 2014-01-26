# todo : move the Battle/UI class into parent dir, since it's an overall UI class.
define ['core/Battle/UI'], (UI) ->
  class Button extends UI
    x : 0
    y : 0
    
    state : 'up'
    
    constructor : (params) ->
      @[k] = v for k, v of params
      sprite = GFXINFO[@sprite_up]
      @w = sprite.width
      @h = sprite.height
    
    draw : ->
      atom.context.drawSprite @_getName(), @x, @y
    
    _getName : ->
      @["sprite_#{@state}"]
        
    tick : ->
      down = atom.input.down 'mouseleft'
      if @containsCursor() and down
        @state = 'down'
      else
        @state = 'up'
      