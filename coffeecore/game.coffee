define [
  'preloader/preloader'
  'core/campaign'
], (preloader, Campaign) ->
  
  window.preloader = preloader
  
  c = new Campaign()
    .render()
    .addUI()
  
  
  
  # todo: remove testing code.
  # window.foo = c;
  
  return
