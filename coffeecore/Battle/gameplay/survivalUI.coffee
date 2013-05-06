define ->
  (map, world, gameplay) ->
  
    if map? and world? and gameplay?

      ACTION =
        BUILD   : 0
        DEPLOY  : 1
        RALLY   : 2
        PATROL  : 3
        RETREAT : 4

      state = 
        action : ACTION.DEPLOY
        click :
          _special  : null

      keypress = (e) ->

        switch e.which
          when 97, 65 # A
            state.action = ACTION.BUILD


        map.ctx.Message =
          text : "Key pressed: #{e.which}"
          time : 40
    
      click = (e) ->
        # Play a sound!
        soundManager.play('click')
        
        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]        
      
      cursor = null

      drawCursor = (e) ->
        # bound to mousemove
        if !(cursor?)
          cursor = preloader.getFile('cursor-select')

        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]

        map.FG.ctx.clear()
        map.FG.ctx.draw({
          img     : cursor
          imgdx   : 0
          imgdy   : 0
          imgw    : 15
          imgh    : 15
          worldx  : x - 8
          worldy  : y - 8
        })

      updateMouseCoords = (e) ->
        [sx,  sy]     = [map.scrollLeft,  map.scrollTop]
        [x,   y]      = [e.pageX+sx,      e.pageY+sy]
        gameplay.UI.mouse = 
          x
          y
      
      # Hide current cursor
      # map.style.cursor = 'none'

      return {
        click :
          context : map
          func    : click
        
        mousemove :
          context : map
          func    : updateMouseCoords

        keypress :
          context : document.body
          func    : keypress
      }
    else
      throw new Error 'no battle map view / battle world / gameplay assigned to this ui behavior!'
    