define ->
  
  EXPLOSIONS = [
    'FragExplosion'
    'SmallExplosion'
    'FlakExplosion'
    'HEAPExplosion'
    'ChemExplosion'
    'SmokeCloud'
    'SmokeCloudSmall'
    'Flame'
    'ChemCloud'
  ]
  
  class SpawnPawn
    x         : 0
    y         : 0
    
    index     : 0
    className : 'FragExplosion'
    team      : 0
      
    containsPoint : (x, y) ->
      return @ if ( @x <= x <= @x+@w ) and ( @y <= y <= @y+@h )
    
    containsCursor : ->
      @containsPoint(atom.input.mouse.x, atom.input.mouse.y)
    
    constructor : (params) ->
      @[k]  = v for k, v of params
      @w    = atom.width
      @h    = @battle.world.h
    
    draw : ->
      atom.context.drawText "Click = create #{@className}\nTeam = #{@team}\nWASD = change class / team"
      
    tick : ->
      # Previous / next class
      if atom.input.pressed('keyA') or atom.input.pressed('keyD')
        if atom.input.pressed('keyA')
          @index--
        else
          @index++
          
        @index = EXPLOSIONS.length - 1 if @index < 0
        @index = 0 if @index >= EXPLOSIONS.length
        
        @className = EXPLOSIONS[@index]
        
      
      if atom.input.pressed('keyW') or atom.input.pressed('keyS')
        @team++
        @team %= 2
        
      
      if @containsCursor() and atom.input.pressed('mouseleft')
        mx = atom.input.mouse.x
        my = atom.input.mouse.y
        
        pawn = new @battle.world.Classes[@className] {
          x     : mx + @battle.scroll.x
          y     : my
          team  : @team
        }
        
        @battle.world.add pawn