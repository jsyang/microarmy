define [
  'core/Battle/view/background'
  'core/Battle/view/foreground'
], (addBackground, addForeground) ->

  #clear = -> @clearRect(0, 0, @width, @height)
  clear = ->
    @clearRect(0, 0, @width, @height)
    if @Message?.time>0
      @text(10 + @el.scrollLeft, 10 + @el.scrollTop, @Message.text)
      @Message.time--
  
  text = (x,y,t)-> @fillText(t,x,y)
  
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

  (world) ->
    if !(world?) then throw new Error 'no world given'
    [w, h]                  = [ world._.w, world._.h ]
  
    el                      = document.createElement 'div'
    canvas                  = document.createElement 'canvas'
    backgroundCanvas        = addBackground(world)
    foregroundCanvas        = addForeground(world)
    foregroundCanvas.ctx    = foregroundCanvas.getContext '2d'
    
    el.appendChild backgroundCanvas
    el.appendChild canvas
    el.appendChild foregroundCanvas
    
    canvas.className        = 'noselect foreground'
    canvas.width            = w
    canvas.height           = h
    
    el.className            = 'battlemap'
    el.style.maxWidth       = window.innerWidth
    el.style.maxHeight      = window.innerHeight
    
    el.ctx                  = canvas.getContext '2d'
    
    # for text.
    el.ctx.fillStyle        = '#ff0000'
    el.ctx.textBaseline     = 'top'
    el.ctx.font             = '10px verdana'
    
    el.ctx.width            = w
    el.ctx.height           = h
    
    # Map view API
    el.ctx.clear            = clear
    el.ctx.draw             = draw
    el.ctx.text             = text
    
    # context2d's parent el
    el.ctx.el               = el
    
    # Map debug text API
    el.ctx.Message          = { text : '', time : 0 }
    
    # Layers API
    el.FG = foregroundCanvas

    el