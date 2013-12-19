# Microarmy

_Fight massive battles with your pixel pawns!_  

### Running the game

`shellscripts/start` to compile from source and **run the game** locally.  
Microarmy is written in Coffeescript (`coffeecore/`), which is compiled into Javascript (`core/`).  

## Tests

Run the jasmine-node unit tests with `shellscripts/test`

## Useful .bash_profile additions

    alias d='/usr/bin/ditz'
    alias coffee='/usr/local/share/npm/bin/coffee'
    alias cwc='coffee -b -w -c'
    alias cwp='coffee -b -w -p'
    alias cw='cwc --output core/ coffeecore/'

## Libs / tools used

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
    