# Microarmy

- is a 2D war simulator.

### Running

1. `npm i`
2. `grunt`
3. Open [http://localhost:3000](http://localhost:3000)







---

## old stuff

### Before creating a build

**Install node, npm and GruntJS.**  
**grunt-spritesmith** uses [GraphicsMagick](http://www.graphicsmagick.org/utilities.html) to compile the spritesheet.
On OSX, you will need to download MacPorts and then
[`port install GraphicsMagick`](http://www.macports.org/ports.php?by=name&substr=magick) in order to run a successful
spritesheet build. Make sure to have `gm` ready before running `grunt`.

Item | Location
--- | ---
Unit tests | `tests/`. Run all the tests for all the units with `grunt test`. All tests are run by default during a build.
Docs & notes | `git checkout docs`  
Issues | `git checkout issues`. You should have [`ditz`](http://stackoverflow.com/questions/2186628/textbased-issue-tracker-todo-list-for-git) installed.
Asset scraps | `git checkout assetscraps` -- things that might inspire future features and various other assets.

### Sprite Naming format

`entity_name`-`team`-`direction`-`action_state`-`frame`.png

Variable | Range of values
--- | ---
`structure` | string
`team` | [0, 1]
`facing_direction` | [0, 1] - left, right
`state` | [0, 1, 2] - good, bad, wreck

Entity | Description | Example
--- | --- | ---
Barracks | Team 0, facing left, in good shape | `barracks-0-0-0.png`
PistolInfantry | Team 0, facing left, shooting, frame 0 | `pistolinfantry-0-0-1-0.png`

### Stripping the generated spritesheet JSON of extra properties
I've added a replacement `json2css` within `custom/`. You should replace `node_modules/grunt-spritesmith/node_modules/json2css/lib/json2css.js` with it.