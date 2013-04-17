define ->
  # Foreground layer DOM element to be consumed by the Battle/view/map
  # Used for special cursors, effects
  (world) ->
    if !(world?) then throw new Error 'no world given'
    
    clear = ->
      @clearRect(0, 0, @width, @height)

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

    # API
    canvas.ctx.clear  = clear
    canvas.ctx.draw   = draw

    canvas