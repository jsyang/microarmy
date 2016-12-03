# Dev log

    Dec 3, 2016
    Begun work on Microarmy once again, there are a lot of infrastructure pieces to be cleaned up. Firstly, the tech stack should
    now be settled. It will include:
      - Grunt (using the grunt directory as the task configs)
      - Browserify to handle all modules (since ES6 is not yet implemented across all platforms)
      - The code will be written in ES5 with no preprocessors.
      - Game resources will be limited to:
        - a single HTML file
        - a single zip file containing all assets: sprites, sounds, music, other resources

      - Game engine is composed of:
        - Assets loader (zip-file reader)
        - Audio loader
        - Image loader
        - Other resource loader
        - ...

      - Scope of this project is reduced to any simulatable combat between two forces with known:
        - Number of units
        - Funds
        
    Editor being used is VSCode with occasional WebStorm.

    Feb 12, 2014
    Moved dev log into its own file. Over the past few days I've added context actions into the sidebar, replacing the "messages"
    area. Motivation behind this was to keep the game playable on mobile while expanding the range of actions available to the
    player when they have certain units selected. I've also added super weapons and a recharge time for each one. Right now,
    only the airstrike super weapon works. Additionally, I had to implement the Battle/Pawn/Aircraft stub to add in the jet bomber
    that is used to drop bombs for this airstrike super weapon. I've also fixed a bunch of bugs, including the Engineer attack
    bug which froze the game because there were no behaviors assigned to InfantryAttack when an Infantry instance does not have
    a ranged weapon. Added more tree variants as well. Changed the control scheme so that left mouse is always selection and right
    mouse is bound to unit orders (move / attack), a la contemporary RTS control schemes.
    
    Death refunds are also a new "feature": players get refunded 30% of the value when an infantry unit dies.
    Construction option buttons are also now scrollable.

    Feb 4, 2014
    The game is now in a playable state. Over the past week I've added these things:
      - mission handler (win/lose)
      - battle sound interface
      - battle UI voice (I even called it EVA)
      - AI player with the ability to construct squads and do recon
      - minimap radar scrolling
      - build options sidebar
    Working on getting the game to build as a node-webkit release. First, I'm going to remove the requirejs/text dependency
    to cut down on the minified file size, and I've already made edits to the grunt-spritesmith to strip the generated CSS of
    all the extra properties that I don't need.
    

    Jan (20, 21), 2014
    Started making sense of the gameplay modes: drafted a "construct base" mode where you can lay down your base structures.
    Converted most of the graphics into a format that has a filenaming convention which better suits grunt-spritesmith.
    Begun revamping the behavior engine. Should move is___ checks into the relevant constructors. Ex: isCrewed should be
    a member of Structure rather than within the default Behaviors. The only stuff that needs to go in there are things
    which rely on other entities? Or maybe it's a better idea to only keep the stats in the inherited classes...

    Jan 18, 2014
    Updated the docs with better formatting. Added main menu UI group and game title placeholder graphic. UI elements stack in groups.
    Mock main menu now has all the functionality it needs UI wise. Just needs to be hooked up to actual button results. Thinking about
    adding TravicCI into the README.

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
