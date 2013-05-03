define ->
  # Foreground layer DOM element to be consumed by the Battle/view/map
  # Used for special cursors, effects, messages
  (world) ->
    if !(world?) then throw new Error 'no world given'
    
    clear = -> @clearRect(0, 0, @width, @height)
        
    text = (message) ->
      if message.x? and message.y? and message.text?
        #if message.text != @Message.text
        lines = message.text.split('\n')
        @fillText(lines[i], message.x + @parent.scrollLeft, message.y + 10*i + @parent.scrollTop + 2) for i in [0...lines.length]
        @Message = message
      else
        throw new Error 'FG.ctx.text() was called with incomplete args!'
    
    draw = (gfx) ->
      if gfx?.img?
        # Call to the Canvas context method "drawImage"
        @drawImage.apply @, [
          gfx.img
          gfx.imgdx
          gfx.imgdy
          gfx.imgw
          gfx.imgh

          gfx.worldx
          gfx.worldy
          gfx.imgw
          gfx.imgh
        ]
      return

    [w,h]             = [world._.w, world._.h]
    canvas            = document.createElement 'canvas'
  
    canvas.className  = 'noselect foreground'
    canvas.width      = w
    canvas.height     = h
    
    canvas.ctx        = canvas.getContext '2d'
    canvas.ctx.width  = w
    canvas.ctx.height = h
    
    # for text.
    canvas.ctx.fillStyle        = '#ff0000'
    canvas.ctx.textBaseline     = 'top'
    canvas.ctx.font             = '10px verdana'
    
    # API
    canvas.ctx.clear  = clear
    canvas.ctx.draw   = draw
    canvas.ctx.text   = text
    
    # Save the message
    canvas.ctx.Message = {}
    
    canvas