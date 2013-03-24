define [
  
  'core/util/$'             # Consumed globally.
  'preloader/preloader'     # Consumed globally.
  
  'core/campaign'
  'core/battle'
  
], ($, HTML5Preloader, Campaign, Battle) ->

  #startGame = ->
  #  b = new Campaign({ w: 30, h: 14 })
  #    .render()
  #    .addUI()
  
  startGame = ->
    b = new Battle()
      .render()
      .addUI()
      .play()
  
    window.game = b
  window.preloader = HTML5Preloader(startGame)
  
  return
