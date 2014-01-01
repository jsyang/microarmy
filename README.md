# Microarmy

_Fight massive battles with your pixel pawns!_

### Running the game

1. Create a release build.
2. `http-server ./ -p 8000` then navigate to `http://localhost:8000`  
Microarmy is written in Coffeescript (`coffee/`), which is compiled into Javascript (`core/`) with the Grunt build system.

### Creating a release build
1. `npm install` to install any dependencies
2. `grunt`
3. Profit!

### Tests

Run the jasmine-node unit tests with `shellscripts/test`

### Useful .bash_profile additions

    alias d='/usr/bin/ditz'
    alias cwc='coffee -b -w -c'
    alias cwp='coffee -b -w -p'
    alias cw='cwc --output core/ coffeecore/'

### Libs / tools used

    jasmine-node
    http-server
    ditz  
    coffeescript
    
    markdown.js
    require.js
      text.js
    HTML5preloader.js
    Sound Manager 2
    
    Paint.NET
    Audacity

### Dev log

    Jan 1, 2014
    Moved all the build steps into one Grunt task with r.js! Deleting lots of unused things.

    Dec 29, 2013
    Looking to release an alpha soon. Trimming down on feature bloat by deleting things that we no longer need.
    The initial release should target desktop web, with future plans to incorporate Ejecta or another Canvas API
    shim layer for native mobile OSes. Thus we should not depend on other than a raw canvas element.
    
    Added grunt to help with release builds.
