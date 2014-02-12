# Microarmy

_Fight massive battles with your pixel pawns!_

### Running the game

1. Install a simple web server: `sudo npm install http-server -g`
2. Install all build dependencies: `npm install`.
3. Build the project: `grunt`.
4. Start a web server in the release directory: `cd dist ; http-server`
5. Navigate to [http://localhost:8080](http://localhost:8080).

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