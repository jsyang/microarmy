define ->
  
  MODE =
    SELECT_NONE  : 0
    SELECT_HOVER : 1
    ATTACK       : 1
    MOVE         : 2
    DEFEND       : 3
  
  class BattleUICursor
    MODE : MODE    
    mode : MODE.SELECT_NONE

    switchCursor : (name) ->
      @mode = MODE[name]

    draw : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      atom.context.drawSprite "cursor-#{@mode}", mx, my, 'middle', 'center'
