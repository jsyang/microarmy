# Microarmy
Build your pixelized military, fight decisive battles, conquer the world

## Issue tracking
Can be found by running "ditz" in the mgmt/ directory.  
Run "ditz html" to build a web snapshot of the issues.

## Release build commands
1. Gather gfx and sfx resources for the HTML5Preloader  

    ./build-preloader-file-list
    
2. Compile core game sources into JS from CS  

    coffee -b -o core/ coffeecore/
    
3. Start the local microarmy webserver  

    ./start

4. [Take a peek at the microarmy wiki](/docs/)  

    http://localhost:8000/docs

5. [Take a peek at the microarmy issues](/mgmt/html/)  

    http://localhost:8000/mgmt/html/
    
## Generate documentation
TODO: Perhaps the coffeedoc / docco should be run on the unit tests rather than the core codebase  

    coffeedoc --parser requirejs coffeecore/

## Tests
Run the jasmine-node unit tests with  

    ./test

## Useful .bash_profile additions
- Single letter ditz  

    alias d='/usr/bin/ditz'

- Add coffee cmdline tool to $PATH or /etc/pathd or use this  

    alias coffee='/usr/local/share/npm/bin/coffee'

- Coffee Watch Compile  
    
    alias cwc='coffee -b -w -c'

- Coffee Watch Print (preview compiled JS code from CS source)  

    alias cwp='coffee -b -w -p'

- Coffee Watch Compile entire CS source into JS  
    
    alias cw='cwc --output core/ coffeecore/'

- Autodoc with coffeedoc  
    alias ad='coffeedoc --parser requirejs coffeecore/'

## Tools used
- jasmine-node
- http-server
- coffeedoc  
  Need to edit the template as to include the base.css otherwise anything within docs/ is overwriten!  
  See lib/index.eco for the docs main template.
- ditz
- coffee
