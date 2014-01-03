# Microarmy

_Fight massive battles with your pixel pawns!_

### Running the game

0. Install a simple web server; ex: `sudo npm install http-server -g`
1. Create a development build of the game.
2. `http-server` then navigate to `http://localhost:8080`

### Creating a build

**grunt-spritesmith** uses [GraphicsMagick](http://www.graphicsmagick.org/utilities.html) to compile the spritesheet.
On OSX, you will need to download MacPorts and then
[`port install GraphicsMagick`](http://www.macports.org/ports.php?by=name&substr=magick) in order to run a successful
spritesheet build. Make sure to have `gm` ready before step 1.

1. `npm install` to install all build tool dependencies.
2. `grunt release` for a minified build
3. Or `grunt` if you don't want to wait for minification and just want to use the debug build.

### Tests

Units are located within `tests/*.spec.coffee`. Run all the tests for all the units with `grunt test`.

### Dev log

    Jan 2, 2014
    Used almond.js shim for requirejs when building a release. Also update the `readme`. Looking into compiling
    the graphics together with a Grunt task. The **pngsmith** engine used in grunt-spritesmith doesn't support tRNS
    PNGs yet so I have to convert all the non-paletted PNGs (created via Paint.NET) to paletted ones. Unless I use
    GraphicsMagick: `sudo port install GraphicsMagick`. That way I can just specify **gm** as the engine in the
    Gruntfile's sprite task instead of trying to convert PNGs every time we want to build the spritesheet.
    Tried to reinstall all the node_modules on the Mini Server and it failed miserably due to the old node version.
    Had to upgrade node using [nvm](https://github.com/creationix/nvm).
    
    Solution: nuke everything: node, npm, node_modules.
    Using Node v0.10.24.
    Reinstall node with nvm. Upgrade npm to latest. And then `npm install` on `microarmy/`. Finally it works!

    Jan 1, 2014
    Moved all the build steps into one Grunt task with r.js! Deleting lots of unused things.

    Dec 29, 2013
    Looking to release an alpha soon. Trimming down on feature bloat by deleting things that we no longer need.
    The initial release should target desktop web, with future plans to incorporate Ejecta or another Canvas API
    shim layer for native mobile OSes. Thus we should not depend on other than a raw canvas element.
    
    Added grunt to help with release builds.

### File structure

    coffee/      
      Behaviors.coffee                      # Behavior-tree parser and interpreter for game pieces
      battle.coffee                         # initiates a Battle. controller-like module
      game.coffee                           # main module. loading this starts the game.
      ui.coffee                             # main menu.
      
      Battle/                               # everything to do with Battles
      
      ui/                                   # todo: write this description
      
      util/
        $.coffee                            # generally useful tools, available globally under $
        animation.coffee                    # shim for jQuery.animate
        autoscroll.coffee                   # scroll viewport contents when mousing near the edge of the viewport (DOM)

    gfx/                                    # graphics
    
    snd/                                    # sounds
    
    tests/                                  # unit tests

    dist/                                   # generated specifically for release builds
      microarmy.zip                         # deploy-ready build product (minified, spritesheeted)
    
    core/                                   # generated intermediary files for a build
    
    lib/
      almond.js                             # smaller shim for require.js
      require.js                            # AMD module loader
      text.js                               # requirejs plugin for loading text resources
      
      preloader/            
        html5Preloader.js                   # preloading
        preloader.js                        # preloading shim for namespacing loaded resources
      
      soundmanager2/
        soundmanager2-config-release.js     # point sm2 to the SWF when it's a release build
        soundmanager2-config.js             # point sm2 to normal SWF location
        soundmanager2-nodebug-jsmin.js      # hybrid HTML5 + flash sound
        soundmanager2.swf                   # fallback for sm2 when HTML5 audio fails

### Libs / tools used

    All the packages within package.json.
    GraphicsMagick
    
    http-server

    markdown.js
    
    require.js / almond.js
      text.js
      
    HTML5preloader.js
    soundmanager2.js
    
    GruntJS
    coffeescript
    ditz
    Paint.NET
    Audacity
