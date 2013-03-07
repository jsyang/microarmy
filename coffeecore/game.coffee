define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/campaign'
  'core/battlec'
  
], ($, HTML5Preloader, Campaign, Battle) ->

  startGame = ->
    b = new Battle() #Campaign()
      .render()
      .addUI()
  
  window.preloader = HTML5Preloader(startGame)
  
  return
