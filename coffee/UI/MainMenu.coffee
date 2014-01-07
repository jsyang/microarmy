define ->
  class MainMenu
    
    tick : ->
      true
    
    draw : ->
      atom.context.drawSprite('mainmenu-newgame',       50, 50)
      atom.context.drawSprite('mainmenu-randombattle',  50, 120)
      atom.context.drawSprite('mainmenu-help',          50, 190)
      