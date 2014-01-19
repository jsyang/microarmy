# Microarmy

_Fight massive battles with your pixel pawns!_

### Running the game

1. Install a simple web server: `sudo npm install http-server -g`
2. Install all build dependencies: `npm install`.
3. Build the project: `grunt`.
4. Start a web server in the release directory: `cd dist ; http-server`
5. Navigate to `http://localhost:8080`

### Creating a build

**grunt-spritesmith** uses [GraphicsMagick](http://www.graphicsmagick.org/utilities.html) to compile the spritesheet.
On OSX, you will need to download MacPorts and then
[`port install GraphicsMagick`](http://www.macports.org/ports.php?by=name&substr=magick) in order to run a successful
spritesheet build. Make sure to have `gm` ready before step 1.

0. You'll need both `node` and `npm` to begin.
1. `npm install` to install all build tool dependencies.
2. `grunt release` for a minified build
3. Or `grunt` if you don't want to wait for minification and just want to use the debug build.

### Tests, Docs, Issue tracking, Scraps

Units are located within `tests/*.spec.coffee`. Run all the tests for all the units with `grunt test`.  

Docs:   `git checkout docs`  

Issues: `git checkout issues`  
  You should have [`ditz`](http://stackoverflow.com/questions/2186628/textbased-issue-tracker-todo-list-for-git)
installed.

Scraps: `git checkout assetscraps`  
  Things that might inspire future features and various other assets.

### Dev log

    Jan 18, 2014
    Updated the docs with better formatting.

    Jan 6, 2014
    Using atom.coffee now instead of rewriting everything to fit within previous codebase. This works better since
    I moved from using multiple canvases to just a single one. A lot of boilerplate work has been taken care of with
    atom, including: preloading, sound and game loop. I just need to finish the port over so I worry less about
    the game engine and more about the game itself. Accordingly, I've deleted soundmanager2, preloader and HTML5preloader.
    The build process has also been simplified, I've removed the preprocess step for now as I'm only targeting web / webkit!

    Jan 5, 2014
    Moving towards a simpler, flatter code-base. Took out `grunt dev` task, since we can just switch the minification
    on and off. Less switches the better; every build is more or less testing a release build. Also rewrote some of
    the display and gameplay logic so the game uses only 1 canvas. May consider moving to atom.coffee later. Deleted
    the starter screen that I'd worked on before. I need to have the battle piece ready before touching any code
    for the menus. Hopefully I'll have a good grasp of what to do to organize gameplay types in a simpler way.

    Jan 4, 2014
    Set up an EC2 instance and grunt-sftp-deploy task to push a release build onto the server for testing.

    Jan 3, 2014
    Continue revising the release build process in Grunt, update the readme with file structure explanations.

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

### Non-code tools used

    GraphicsMagick
    http-server
    ditz
    Paint.NET
    Audacity
