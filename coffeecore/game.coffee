define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/battle'
  
], ($, HTML5Preloader, Battle) ->

  startGame = ->
    b = new Battle()
    b.play()
      
    window.game = b
    
  window.preloader = HTML5Preloader(startGame)
  
  return
