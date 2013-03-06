define [
  'core/Battle/view/background'
], (addBackground) ->
  clear = ->
    @clearRect(0, 0, @width, @height)
  
  draw = (gfx) ->
    if gfx?.img?
      @drawImage.apply @, [
        gfx.img
        gfx.imgdx   # should be named "imgx"?
        gfx.imgdy
        gfx.imgw
        gfx.imgh
        
        gfx.worldx
        gfx.worldy
        gfx.imgw
        gfx.imgh
      ]
    return

  (world) ->
    if !(world?) then throw new Error 'no world given'
  
    el                      = document.createElement 'div'
    canvas                  = document.createElement 'canvas'
    backgroundCanvas        = addBackground(world)
    
    el.appendChild backgroundCanvas
    el.appendChild canvas
    
    
    canvas.className        = 'noselect'
    canvas.width            = world.w
    canvas.height           = world.h
    
    el.className            = 'battlemap'
    el.style.maxWidth       = window.innerWidth
    el.style.maxHeight      = window.innerHeight
    
    el.ctx                  = canvas.getContext '2d'
    
    el.ctx.width            = world.w
    el.ctx.height           = world.h
    
    # Map view API
    el.ctx.clear            = clear
    el.ctx.draw             = draw
    
    el