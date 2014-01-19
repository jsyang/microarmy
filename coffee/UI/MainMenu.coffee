define [
  'core/UI/Button'
  'core/UI/VerticalStack'
], (Button, VerticalStack) ->
  class MainMenu
    
    constructor : (params) ->
      @[k] = v for k, v of params
      
      MENUBUTTONS = new VerticalStack({
        align   : 'center'
        x       : 50
        y       : 50
        margin  : 20
        children : [
          new Button { sprite : 'mainmenu-title' }
          new Button { sprite : 'mainmenu-newgame' }
          new Button { sprite : 'mainmenu-randombattle' }
          new Button { sprite : 'mainmenu-help' }
        ]
      })
      
      @children = [
        MENUBUTTONS
      ]
    
    tick : ->
      mx = atom.input.mouse.x
      my = atom.input.mouse.y
      
      # Check for clicks
      if atom.input.pressed('mouseleft')
        for el in @children
          eventTarget = el.containsPoint(mx, my)
          if eventTarget?
            eventTarget.click()
            return 
      true
    
    draw : ->
      for el in @children
        el.draw()