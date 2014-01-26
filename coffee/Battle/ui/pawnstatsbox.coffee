define ->

  # Shows vital stats for important units.
  # There should only be one onscreen at a time.

  class BattleUIPawnStatsBox
    w           : 90
    margin      : 32
    lineHeight  : 12
    constructor : (pawn, battle) ->
      @battle = battle
      @pawn = pawn
      @pawnName = pawn.constructor.name
      @pawnSpriteHeight = @pawn._halfHeight << 1
      @_setColors(pawn.team)
    
    _setColors : (team) ->
      @stroke_color     = 'rgb(11,11,11)'
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
        @pawn.nameText
        "#{@pawn.health_current} / #{@pawn.health_max} HP"
      ]
    
    draw : ->
      atom.context.save()
      
      lines = @_getText()
      h     = lines.length * @lineHeight
      
      x = @pawn.x - (@w >> 1) + 0.5 - @battle.scroll.x
      y = @pawn.y - h - @pawnSpriteHeight - @margin + 0.5
      
      atom.context.lineWidth   = '1'
      atom.context.strokeStyle = @stroke_color
      atom.context.strokeRect x, y, @w, h
      
      atom.context.fillStyle   = @body_color
      atom.context.fillRect x + 1, y + 1, @w - 2, h - 2
      
      atom.context.fillStyle   = @header_color
      atom.context.fillRect x + 1, y + 1, @w - 2, @lineHeight
      
      atom.context.drawText lines, x + 1, y + 1, @stroke_color
      
      y1 = @pawn.y - @pawnSpriteHeight + 0.5
      y2 = y1 - @margin
      
      x = @pawn.x + 0.5 - @battle.scroll.x
      atom.context.beginPath()
      atom.context.moveTo x, y1 - 8
      atom.context.lineTo x, y2
      atom.context.stroke()
      
      atom.context.restore()