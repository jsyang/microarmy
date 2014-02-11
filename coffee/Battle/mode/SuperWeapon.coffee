define ['core/Battle/UI'], (BattleUI) ->
  class SuperWeapon extends BattleUI
    
    _airstrike : (x) ->
      entity = new @battle.world.Classes['SmallJet'] {
        x          : 0
        y          : 30
        team       : @team
        direction  : 1 #@direction
        rally_x    : x
        attack_x   : x
      }
      @battle.world.add entity
      @battle.ui.sound.JET_FLYBY()
      entity
  
    resize : ->
      @w = atom.width - @battle.ui.sidebar.w
      @h = @battle.world.h
  
    tick : ->
      if @containsCursor()
        if atom.input.pressed('mouseleft')
          @["_#{@superweapon}"] atom.input.mouse.x + @battle.scroll.x
          @battle.resetMode()
      else
        @battle.ui.cursor.clearText()

    constructor : (params) ->
      @[k]  = v for k, v of params
      @team = @battle.player.team
      @resize()
      