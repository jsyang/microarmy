define [
  'preloader/preloader'
  'core/campaign'
  'core/battlec'
], (preloader, Campaign, Battle) ->
  
  window.preloader = preloader
  
  #c = new Campaign()
  #  .render()
  #  .addUI()
  
  b = new Battle()
  
  return
