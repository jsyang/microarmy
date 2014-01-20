define [
  'core/UI/Button'
  'core/UI/UIGroup'
], (Button, UIGroup) ->
  class MainMenu
    
    clickedHelp : ->
      window.location.href = 'http://jsyang.ca'
    
    clickedNewGame : ->
      @game.switchMode('Battle')
      
    clickedRandomBattle : ->
      console.log '!random'
    
    constructor : (params) ->
      @[k] = v for k, v of params
      
      MENUBUTTONS = new UIGroup({
        align    : 'center middle'
        vmargin  : 20
        children : [
          new Button { sprite : 'mainmenu-title' }
          new Button { sprite : 'mainmenu-newgame',       click : @clickedNewGame.bind @ }
          new Button { sprite : 'mainmenu-randombattle',  click : @clickedRandomBattle.bind @ }
          new Button { sprite : 'mainmenu-help',          click : @clickedHelp.bind @ }
        ]
      })
      
      @children = [
        MENUBUTTONS
      ]
    
    tick : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      
      if atom.input.pressed('mouseleft')
        for el in @children
          eventTarget = el.containsPoint(mx, my)
          eventTarget?.click?()
          return
      true
    
    draw : ->
      el.draw() for el in @children