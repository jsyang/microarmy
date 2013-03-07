define ->

  # Hex color string to dec value by color.
  hs2d = (hs, color) ->
    index =
      'r' : 0
      'g' : 2
      'b' : 4
    index = index[color]
    parseInt(hs[index...index+2], 16)

  # Spit out a background layer DOM element to be consumed by the Battle/view/map
  (world) ->
    if !(world?) then throw new Error 'no world given'

    canvas            = document.createElement 'canvas'
  
    canvas.className  = 'noselect'
    canvas.width      = world.w
    canvas.height     = world.h
    
    ctx               = canvas.getContext '2d'
    
    imgdata = ctx.createImageData(world.w, world.h)
    d = imgdata.data

    # todo: make more than 2 color sky gradients?
    color = [
      ["112111", "acacac"]
      ["442151", "ffac2c"]
      ["F2F8F8", "848B9A"]
    ][ $.R(0,2) ]

    terrainColor = [
      "7DA774"  # bedrock
      "5D3825"  # moss
      "8498A4"  # topsoil
      "ADA159"  # sand
      "9F9973"  # steeps
    ][ $.R(0,4) ]
    
    rgbT = 
      r : hs2d(terrainColor,'r')
      g : hs2d(terrainColor,'g')
      b : hs2d(terrainColor,'b')

    # Make a gradient from terrain color to black
    terrainGradient = []
    (
      terrainGradient.push {
        r : rgbT.r - y
        g : rgbT.g - y
        b : rgbT.b - y
      }
    ) for y in [0...world.h]
    
    rgb1 = 
      r : hs2d(color[0],'r')
      g : hs2d(color[0],'g')
      b : hs2d(color[0],'b')

    rgb2 =
      r : hs2d(color[1],'r')
      g : hs2d(color[1],'g')
      b : hs2d(color[1],'b')

    h_ = 1/world.h;
    
    [cR, cG, cB] = [rgb1.r, rgb1.g, rgb1.b]
    
    [dR, dG, dB] = [
      rgb2.r-rgb1.r
      rgb2.g-rgb1.g
      rgb2.b-rgb1.b
    ]
    
    [dR, dG, dB] = [dR*h_, dG*h_, dB*h_]

    # Color the background and terrain
    (
      (
        c = 4*(y*world.w + x)
        dSurface = world.heightmap[x]
        
        if dSurface > 0
          # Sky
          if y < dSurface
            d[c+0] = Math.round(cR)
            d[c+1] = Math.round(cG)
            d[c+2] = Math.round(cB)
          
          # Terrain
          else
            color = terrainGradient[y-dSurface]
            d[c+0] = color.r
            d[c+1] = color.g
            d[c+2] = color.b
          
        d[c+3] = 0xFF
        
      ) for x in [0...world.w]
      [cR, cG, cB] = [cR+dR, cG+dG, cB+dB]
    ) for y in [0...world.h]
    
    ctx.putImageData imgdata, 0, 0
    
    canvas