# stolen from Battle/view/map
define [
  'core/campaign/view/map/drawTerrain'
], (drawTerrain) ->
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
  
  tileFill = (x,y,w,h,gfx) ->
    (
      (
        whatToDraw = $.extend {
          img     : preloader.getFile('micropolis')
          worldx  : 8*i
          worldy  : 8*j
        }, gfx
        @draw(whatToDraw)
      ) for i in [x...x+w]
    ) for j in [y...y+h]
    
  tileDraw = (x,y,gfx,size='8x8') ->
    whatToDraw = $.extend {
      img     : preloader.getFile('micropolis')
    }, gfx
    
    whatToDraw.worldx = 8*x
    whatToDraw.worldy = 8*y
    
    if size=='24x24'
      whatToDraw.worldx -= 8
      whatToDraw.worldy -= 8
    
    @draw(whatToDraw)
  
  (world) ->
    if !(world?) then throw new Error 'no world given'
  
    el                      = document.createElement 'div'
    canvas                  = document.createElement 'canvas'
    
    el.appendChild canvas
    
    
    canvas.className        = 'noselect'
    canvas.width            = world.w*8
    canvas.height           = world.h*8
    
    el.className            = 'map'
    el.style.maxWidth       = window.innerWidth - 180;
    el.style.maxHeight      = window.innerHeight
    
    el.ctx                  = canvas.getContext '2d'
    
    el.ctx.width            = world.w
    el.ctx.height           = world.h
    
    # API
    el.ctx.clear            = clear
    el.ctx.draw             = draw
    el.ctx.tileFill         = tileFill
    el.ctx.tileDraw         = tileDraw
    
    drawTerrain.call(el.ctx, world)
    
    el