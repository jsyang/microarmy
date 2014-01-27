define ->
  class BattleUIPawnHealthBar
    h      : 4 # Bar height
    margin : 4 # Bottom margin only.
    
    COLOR :
      background  : 'rgb(44,44,44)'
      health      : 'rgb(44,252,44)'
      build       : 'rgb(255,252,71)'
    
    PROPERTY : [
      'health'
      'build'
    ]
    
    _setMultipliers : ->
      @has = {}
      for p in @PROPERTY when @pawn["#{p}_current"]?
        @["_1#{p}_max"] = 1 / @pawn["#{p}_max"]
        @has[p] = true
    
    _getBarWidth : (type) ->
      (@pawn["#{type}_current"] * @["_1#{type}_max"] * @pawnSpriteWidth) >> 0
      
    _drawBar : (p, type) ->
      if @has[type]
        atom.context.fillStyle = @COLOR.background
        atom.context.fillRect p.x, p.y, @w, @h
        atom.context.fillStyle = @COLOR[type]
        w = @_getBarWidth(type) - 2
        w = 1 if w < 1
        atom.context.fillRect p.x + 1, p.y + 1, w, @h - 2
        p.y -= @h - 1
    
    draw : ->
      position = 
        x : @pawn.x - @w2 - @battle.scroll.x
        y : @pawn.y - @pawnSpriteHeight - @margin - @h
      atom.context.save()
      @_drawBar(position, property) for property in @PROPERTY
      atom.context.restore()
      
    constructor : (pawn, battle) ->
      @battle = battle
      @pawn = pawn
      @_setMultipliers()
      name = pawn.getName()
      @pawnSpriteHeight = GFXINFO[name].height
      @pawnSpriteWidth  = GFXINFO[name].width
      @w  = @pawnSpriteWidth
      @w2 = @w >> 1