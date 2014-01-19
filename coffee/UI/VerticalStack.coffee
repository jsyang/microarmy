define ->

  # Aligns a set of UI elements in a stack, left-justified (for now).
  
  # Alignments:
  # Horizontal: left, center, right
  # Vertical:   top,  middle, bottom
  
  # todo: this is actually a group. rename and repurpose so it horizontally stacks as well.
  class VerticalStack
    x         : 0
    y         : 0
    w         : 0
    h         : 0
    margin    : 10
    # outerHAlign : 'center'
    # children  : {}
    
    constructor : (params) ->
      @[k] = v for k, v of params
      
      @_initAlignments()
      @_alignChildren()
      @_stackChildren()
    
    # Turn alignments string into dict
    _initAlignments : ->
      if @align?
        @align = @align.split(' ')
        align = {}
        for v in @align
          align[v] = true
        @align = align
    
    # Set children X values
    _alignChildren : ->
      if @children?.length > 0
        x = @x
        
        if 'center' of @align
            x = atom.width >> 1
            x -= GFXINFO[@children[0].sprite].width >> 1
        
        # todo: if 'middle' of @align
        
        for el in @children
          el.x = x
    
    # Set children Y values
    _stackChildren : ->
      if @children?.length > 0
        stackHeight = 0
        
        for el in @children
          el.y = @y + stackHeight
          stackHeight += GFXINFO[el.sprite].height + @margin
    
    # click : -> # click handler
    
    draw : ->
      for el in @children
        el.draw()
        
    containsPoint : (x, y) ->
      for el in @children
        if el.containsPoint(x, y)
          return el