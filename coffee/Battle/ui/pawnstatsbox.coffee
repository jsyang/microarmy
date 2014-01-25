define ->
  class BattleUIPawnStatsBox
    w           : 90
    h           : 60
    margin      : 32
    lineHeight  : 12
    constructor : (pawn) ->
      @pawn = pawn
      @w2 = @w >> 1
      @h2 = @h >> 1
      @pawnName = pawn.constructor.name
      @pawnSpriteHeight = @pawn._halfHeight << 1
      #@pawnSpriteWidth  = @pawn._halfWidth  << 1
      @_setColors(pawn.team)
    
    _setColors : (team) ->
      @stroke_color     = 'rgb(11,11,11)'
      @highlight_color  = 'rgb(200,220,200)'
      @header_color = [
        'rgb(135,171,237)'
        'rgb(147,217,147)'
      ][team]
      @body_color = [
        'rgb(211,220,235)'
        'rgb(212,235,211)'
      ][team]
    
    _getText : ->
      [
        @pawnName
        "#{@pawn.health_current} / #{@pawn.health_max} HP"
      ]
    
    draw : ->
      atom.context.save()
      
      x = @pawn.x - @w2 + 0.5
      y = @pawn.y - @h - @pawnSpriteHeight - @margin + 0.5
      
      atom.context.lineWidth   = '1'
      atom.context.strokeStyle = @stroke_color
      atom.context.strokeRect x, y, @w, @h
      
      atom.context.fillStyle   = @body_color
      atom.context.fillRect x + 1, y + 1, @w - 2, @h - 2
      
      atom.context.fillStyle   = @header_color
      atom.context.fillRect x + 1, y + 1, @w - 2, @lineHeight
      
      atom.context.drawText @_getText(), x + 1, y + 1, @stroke_color
      
      y1 = @pawn.y - @pawnSpriteHeight + 0.5
      y2 = y1 - @margin
      atom.context.strokeStyle = @highlight_color
      atom.context.moveTo @pawn.x + 0.5, y1 - 8
      atom.context.lineTo @pawn.x + 0.5, y2 
      atom.context.stroke()
      
      atom.context.restore()