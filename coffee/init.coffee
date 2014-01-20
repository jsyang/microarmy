define [
  'core/util'
  'core/atom'
  
  'core/Game'
  
  'text!core/spritesheet.json'
  'text!core/RESOURCES_SND.txt'
], (_util, _atom, MicroarmyGame, GFXJSON, SFXLIST) ->

  window.GFXINFO = JSON.parse(GFXJSON)

  loaded =
    gfx : false
    sfx : false
    
  isPreloadComplete = ->
    if loaded.gfx and loaded.sfx
      window.Microarmy = new MicroarmyGame()
      window.Microarmy.switchMode 'Battle' # 'MainMenu'
      window.Microarmy.run()
      true
    else
      false

  atom.preloadImages(
    { spritesheet : 'core/spritesheet.png' },
    ->
      loaded.gfx = true
      isPreloadComplete()
  )
  
  # Create sound dictionary
  SOUNDSDICT = {}
  for soundname in SFXLIST.split('\n')
    SOUNDSDICT[soundname] = "./core/snd/#{soundname}" unless soundname.length is 0
  
  atom.preloadSounds(
    SOUNDSDICT,
    ->
      loaded.sfx = true
      isPreloadComplete()
  )

  return
