define [
  'core/Battle/view/background'
], (generateBackground) ->

  # View helpers #######################################################################################################

  clear = -> @clearRect(0, 0, @width, @height)
  
  drawBackground = (x = 0, y = 0) ->
    @ctx.putImageData(@backgroundImgData, x, y)
   
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

  text = (message) ->
    if message.x? and message.y? and message.text?
      lines = message.text.split('\n')
      if message.color?
        @fillStyle = message.color
      @fillText(lines[i], message.x + @dx, message.y + 10*i + @dy + 2) for i in [0...lines.length]
      @Message = message
      
    else
      throw new Error 'canvas.ctx.text() was called with incomplete args!'
  
  highlight = (args) ->
    if args.color? and args.x? and args.w?
      @globalAlpha  = 0.1
      @fillStyle    = args.color
      @fillRect(args.x-(args.w>>1), 0, args.w, @height)
      @globalAlpha  = 1
      
    else
      throw new Error 'ctx.highlight not given with proper args!'
  
  # View-creator func ##################################################################################################
  # This gets returned.
  (world) ->
    if !(world?) then throw new Error 'no world given'
  
    canvas = document.createElement 'canvas'
    
    # DOM styles
    canvas.className          = 'noselect foreground'
    canvas.width              = window.innerWidth
    canvas.height             = window.innerHeight
    #canvas.onresize
    
    canvas.ctx                = canvas.getContext('2d')
    canvas.backgroundImgData  = generateBackground(world)
    
    # Highlight styles
    canvas.ctx.width                    = canvas.width
    canvas.ctx.height                   = canvas.height
    
    # Viewport offsets
    canvas.ctx.dx             = 0
    canvas.ctx.dy             = 0
    
    # Text styles
    canvas.ctx.fillStyle    = '#ff0000'
    canvas.ctx.textBaseline = 'top'
    canvas.ctx.font         = '10px verdana'

    # API
    canvas.ctx.drawBackground = drawBackground.bind(canvas)
    canvas.ctx.clear          = clear
    canvas.ctx.Message        = {}
    canvas.ctx.draw           = draw
    canvas.ctx.text           = text
    canvas.ctx.highlight      = highlight

    canvas