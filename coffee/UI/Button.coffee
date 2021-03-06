# todo : move the Battle/UI class into parent dir, since it's an overall UI class.
define ['core/Battle/UI'], (UI) ->
  class Button extends UI   
    state : 'up'
    contained_cursor : false
    
    _getName : ->
      @["sprite_#{@state}"]
    
    draw : ->
      atom.context.drawSprite @_getName(), @x, @y
        
    tick : ->
      userActiveInteraction = false
      pressedL  = atom.input.pressed  'mouseleft'
      releasedL = atom.input.released 'mouseleft'
      
      pressedR  = atom.input.pressed  'mouseright'
      releasedR = atom.input.released 'mouseright'
      
      downL     = atom.input.down 'mouseleft'
      if @containsCursor()
        @contained_cursor = true
        @state = 'up'
        @state = 'down' if downL
        if releasedL
          @pressed?()
          userActiveInteraction = true
        if releasedR
          @pressedR?()
          userActiveInteraction = true
        @over?()
      else
        if @contained_cursor
          @out?()
          @contained_cursor = false
        @state = 'up'
    
      userActiveInteraction
    
    constructor : (params) ->
      @[k] = v for k, v of params
      sprite = GFXINFO[@sprite_up]
      @w = sprite.width
      @h = sprite.height