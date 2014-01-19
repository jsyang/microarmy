define ->

  # Aligns a set of UI elements in a stack, left-justified (for now).
  
  # Alignments:
  # Horizontal: left, center, right
  # Vertical:   top,  middle, bottom
  
  # todo: this is actually a group. rename and repurpose so it horizontally stacks as well.
  class UIStack
    x         : 0
    y         : 0
    vmargin   : 0
    hmargin   : 0
    
    # todo: orientation : 'horizontal' or 'vertical'
    # align : 'center middle'
    # children  : {}
    
    constructor : (params) ->
      @[k] = v for k, v of params
      
      @_initAlignments()
      @_alignChildren()
    
    # Turn alignments string into dict
    _initAlignments : ->
      if @align?
        @align = @align.split(' ')
        align = {}
        for v in @align
          align[v] = true
        @align = align
    
    _sumChildrenHeight : ->
      sum = 0
      for el, i in @children
        sum += GFXINFO[el.sprite].height
        sum += @vmargin unless i is 0
      sum
    
    _sumChildrenWidth : ->
      sum = 0
      for el, i in @children
        sum += GFXINFO[el.sprite].width
        sum += @hmargin unless i is 0
      sum
    
    _alignChildren : ->
      if @children?.length > 0
        
        if 'middle' of @align
            y = @y
            y += atom.height >> 1
            y -= @_sumChildrenHeight() >> 1
            @y = y
              
        if 'center' of @align
            x = @x
            x += atom.width >> 1
            x -= GFXINFO[@children[0].sprite].width >> 1
            
            stackHeight = 0
            for el in @children
              el.x = @x + x
              el.y = @y + stackHeight
              stackHeight += GFXINFO[el.sprite].height + @vmargin
    
    draw : ->
      for el in @children
        el.draw()
        
    containsPoint : (x, y) ->
      for el in @children
        if el.containsPoint(x, y)
          return el