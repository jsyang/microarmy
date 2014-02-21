define [
  'core/util'
  'core/atom'
  
  'core/Game'
  
  'core/GFXINFO'
  'core/SFXINFO'
], (_util, _atom, MicroarmyGame, _GFXINFO, SFXINFO) ->
  loaded =
    gfx : false
    sfx : false
    
  isPreloadComplete = ->
    if loaded.gfx and loaded.sfx
      Microarmy = new MicroarmyGame()
      Microarmy.switchMode 'Battle' # 'MainMenu'
      Microarmy.run()
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
  for soundname in SFXINFO
    SOUNDSDICT[soundname] = "core/snd/#{soundname}" unless soundname.length is 0
  
  atom.preloadSounds(
    SOUNDSDICT,
    ->
      loaded.sfx = true
      isPreloadComplete()
  )

  return
