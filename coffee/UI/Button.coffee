define ->
  
  class Button
    x         : 0
    y         : 0
    w         : 0
    h         : 0
    shape     : 'rect'
    PI2       : 2*Math.PI
    state     : 'up'
    stateColor :
      pressed : '#b00'
      up      : '#f00'
      
    containsPoint : (x, y) ->
      return ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )

    draw : ->
      ac = atom.context
      
      if @color?.opacity?
        ac.save()
        ac.globalAlpha = @color.opacity
        ac.globalCompositeOperation = 'lighter'
      
      switch @shape
        when 'circle'
          ac.lineWidth    = 2
          ac.strokeStyle  = '#111'
          ac.fillStyle  = @stateColor[@state]
          
          ac.beginPath()
          ac.arc(@x+16, @y+16, @w, 0, @::PI2);
          ac.fill()
          
        when 'rect'
          ac.lineWidth    = 2
          ac.strokeStyle  = '#111'
          ac.fillStyle  = @stateColor[@state]
          
          ac.fillRect(@x, @y, @w, @h)
          ac.strokeRect(@x, @y, @w, @h)
          
        when 'sprite'
          # Use the sprite sheet
          ac.drawSprite(@sprite, @x, @y)
      
      if @color?.opacity?
        ac.restore()
    
    click : ->
      alert(@sprite)
    
    constructor : (params) ->
      @[k] = v for k, v of params
      if @sprite?
        sprite = GFXINFO[@sprite]
        @shape = 'sprite'
        @w     = sprite.width
        @h     = sprite.height
    
    