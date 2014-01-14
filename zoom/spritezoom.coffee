# scale a game sprite
define ->

  sprites =
    pistol    : [8, 8]
    rocket    : [8, 8]
    engineer  : [8, 8]

    scaffold  : [16,8]
    mine      : [5,2]
    pillbox   : [19,8]
    turret    : [22,9]
    
    missileracksmall  : [4,7]
    ammodumpsmall     : [4,6]
    missilerack       : [5,9]
    ammodump          : [18,9]
    watchtower        : [13,21]
    relay             : [15,27]
    comm              : [28,28]
    barracks          : [32,12]
    depot             : [39,16]
    helipad           : [28,11]
    repair            : [28,14]

  zoom = (id, w, h, scale=2) ->
    # filename only. not the path.
    id = id.split('/').pop()
      
    [w, h] = sprites[id] unless w? && h?
    
    scale = parseInt scale
    c = document.createElement 'canvas'
    [c.width, c.height] = [scale*w, scale*h]
    
    i = new Image
    
    i.src = '/images/ingame/' + id + '1.png'
    
    i.onload = ->
      ctx = c.getContext '2d'
      ctx.drawImage i, 0, 0
      data = ctx.getImageData(0, 0, w, h).data
      ctx.clearRect 0, 0, c.width, c.height
      offset = 0
      (
        (
          rgba = [
            data[offset++]
            data[offset++]
            data[offset++]
            data[offset++] / 100.0
          ]
          ctx.fillStyle = 'rgba(' + rgba + ')'
          ctx.fillRect x*scale, y*scale, scale, scale
        ) for x in [0..w-1]
      ) for y in [0..h-1]
      
      return
  
    c
  
  _ = window.location.hash.slice(1).split(',')
  document.body.appendChild zoom.apply undefined, _ unless _.length == 0