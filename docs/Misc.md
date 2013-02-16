# Misc. Notes
    
    - new units / game pieces
        -- vehicles
            --- threshold levels for raising and lowering track pieces for tanks and such
            --- max slope the vehicle is able to handle
                ---- behavior to see what to do if vehicle cannot advance
                    ----- stop and hold
                    ----- reverse
                    ----- radio commander for transport heli
                    ----- radio commander to level terrain
                    ----- crew debarks
        -- encampments
            --- mg nest instead of pillbox  (2 x crew)
            --- mortar nest                 (2 x crew, functions immediately)
            --- one way barrier             (friendlies move unrestricted, enemies running into it must destroy it first)
            --- logistics tent              (makes reloading of missiles / encampments faster, heals infantry)
            --- observation post            (enlarges range of commander attention in immediate area; sets rally points for squads, picks better targets for missile launchers)
            --- jamming station             ()
        -- new aircraft
            --- transport heli              (3 x medium storage)
            --- light attack heli           (4 x smallrocket)
            --- heavy bomber                (6 x fuel air bomb / 1 x tactical nuke)
            --- intercepter                 (4 x AA missile)
            --- spaceplane                  (2 x large storage / 2 x bunker buster)
            --- small ufo craft             (1 x medium storage, long range, high speed, low fuel capacity)
    
        -- booby trapped buildings          (if occupied by enemy forces, it has a special effect? blows up, reveals some intel to the rigger?)
            -- if booby trappee wins,
        -- hideout structures [either friendly / enemy]
                --- fires from random position in the hideout sprite
                --- when they fire and the targets are "in the hideout", positions of hideout units are revealed
            - bunker
            - cave
            - urban bunker -- fortified high rise
                -- level 1, 2, 3 functions as separate mini-battles, only infantry can participate
                -- OR level the whole thing
                    --- morale effects
                    --- loss of loot, intel, etc
            - jungle woods, tall grass, swamp
            - temperate woods
            - underground bunker (cave entrance)
            - desert oasis
    
    - interface notes (todo)
        -- high altitude aircraft indicator for battles
    
    - huge tank plot device?
        -- breaks into pieces that must be destroyed individually
        -- pieces individually attack separate bases
        -- basically a mobile base (mother craft)
    
    - story options
        -- STARTING GOOD: defeat the evil empire (like jagged alliance)
            --- ENDING EVIL: story twist : you are the bad guy
        -- STARTING EVIL: conquer the native lands
            --- ENDING GOOD: improve the conquered land
        -- MIDGAME TWIST: alien invasion
            --- must team up with former enemy to defeat the invader
        -- TWIST: alliances
            --- sign pacts with other forces for benefits, but must uphold the conditions
            --- can negotiate with enemy
        -- CUSTOMIZATION
            --- banner / flag of your force
            --- characteristics of your troops / commanders (permanent)
            --- these can set behavioral precedents in troops / commanders
            --- give the user the ability to create custom weapons (btree editing)
                ---- the more powerful the weapon, the more expensive it is to create
        -- ROGUELIKE:
            --- retire at any time, get a score, etc.
            --- focus may change based on game progress
            --- "high score" list
    
    - status report on production, morale
        -- occupied territories
        -- enemy territories (via intel)
    
    - debriefing screen
        -- vital stat motifs (what should the player care about)
           CAN SEARCH FOR CANDIDATES ON http://thenounproject.com
            --- salvage         (scrap / disposal / salvage)
            --- casualties      (loss / alzheimer's icon / skull / tomb)
            --- net supplies    (warehouse / crate / barrel / drum / oil / petrol / ammunition box)
            --- new intel       (spy / blueprints / surveillance / scout)
            --- net facilities  (critical facility)
    
        -- short summary
            --- net supplies    [resources]
            --- net facilities  [facilities captured / salvaged / lost]
            --- net personnel   [troops + prisoners]
            --- net equipment   [amount available after rearming the remaining personnel]
    
    - strategy info screen
        -- net funds (over last 3 turns)
        -- net resources (including resource demands about to reach critical levels)
        -- troop approval   (affects desertion rate)
        -- citizen approval (affects production rate)
        -- alliance / enemy status
        -- if reporting to another commander, the other commander's approval rating of you
        -- other approval rating of other commanders in similar rank
    
        -- auto-battles. when player entity is not present for a battle
            -- kind of like JA2
    
    
    - build base on campaign view like xcom bases
        -- base modules that have proportioned defenses?
            --- also have the ability to clone custom user modules (if sufficient resources)
            --- build time in days
        -- modules: TODO, come up with prefab'd modules
    
    - logistics is a minigame?
        -- part of strategic gameplay
        -- action points for moving things
        -- encumberance is part of action point penalty
        -- movers
            --- fuel capacities = action points
            --- stranded equipment if traveling range is beyond fuel capacity
            --- movement already inflicts a fuel penalty
            --- different penalties / bonuses for various terrain types
            --- show range of movement when mover is selected
            --- mover can be a group or a single unit
            --- assign behavioral priorities for movers
                ---- 1. rescue (resupply) stranded equipment if mover is a 'scavenge' entity
                ---- 2. AI movers should compute whether or not a move will strand itself
                ---- 3. special movers are one way... super weapons?
                ---- 4. movers will not include items that impede movement? or at least give a warning when its basic stats change..
                    ----- should make this pretty obvious, kind of like #2
        -- terrain types
            --- roads            [ rails / highways ]
            --- facility tiles   [ docks / bases / cities ]
            --- land             [ seaLevel + ]
            --- water            [ > seaLevel - 2 ]
                ---- no large watercraft
            --- deep water       [ < seaLevel - 2 ]
                ---- all watercraft
        -- moving through enemy / unknown territory incurs a x2 fuel penalty
            --- bad idea?
            --- can be fired upon through interrupts while mover is in a turn
            --- maybe a 1.2x fuel penalty OR up to 2x fuel penalty, individual tile penalties randomized
    
    - helicopter unit
        [DONE] flight characteristics
            [DONE] inertial movement (from HomingMissile)
            [DONE] forward pitch
            [DONE] turn in place
            --- turn in flight
            --- ground effect
        -- no runway needed
        -- refueling occurs without special equipment
        -- slower than other aircraft
        -- faster than all ground vehicles, except maybe high speed rail
        -- can loiter in battle / park so fuel consumption is minimized
        -- storage accessible while in battle
    
    - salvage / loss calculator
        -- destroyed => roll to drop a 'destroyed' version into the scrap bin OR lose it all
            --- at the end, convert destroyed versions into their compound parts
        -- used => engineers / infantry used to build a structure
            --- if destroyed, roll either to be taken prisoner OR to recover the personnel
    
    - line of sight for battle view
        -- can already know this from a list of the critical points in the terrain
        -- the code is trivial
    
    - commanders bidding war campaign mechanic (political phase)
        -- commanders are __A__ when choices[] are __B__ desires[]
            A               B
            overwhelmed     >
            frustrated      <
            content         =
        -- have them bid on things that will happen in later phases of a campaign turn
            --- campaign turn encompasses 2 days game time?
    
    - gameplay pacing (as player progresses.., this is the gameplay type that sets the interest curve)
        -- 1. only micromanagement (1 unit)
        -- 2. only macromanagement (enclosing squad)
        -- 3. micromanagement > macromanagement (multiple roles of individuals, little choice in macro)
        -- 4. macromanagement > micromanagement (multiple commanders, little choice in micro, unless specified)
        -- 5. control is stripped from you (micromanagement of escape vehicle)
        -- 6. macromanagement of infiltrated units
        -- 7. total control of final push
    
    - commander specialties (each commander must have a specialty or unknown if none)
        -- list of specialties
            --- infantry
            --- artillery
            --- mechanized infantry
            --- shock combat
            --- intel
            --- logistics
        -- each specialty has a regular ability and a special ability associated with it
            --- ex: infantry special = defensive fortification
                    infantry regular = temporary dig in
    
    - sound hash for noisier / meatier sounding battles
        -- sounds enter into a queue per frame, with the hash being the sound type it wants to play
        -- ex:
            {
                rifle   : 23,
                mgun    : 3
            }
        -- processed like:
            for(hashedSound in sounds) {
                if(hashedSound.count < 3) {
                    if(hashedSound == 'rifle')
                        playSound('riflefire', 30%);
                } else if(hashedSound.count < 9) {
                    if(hashedSound == 'rifle')
                        playSound('riflebarrage', 50%);
                }
            }
    
    - macro-control vs micro-control
        - ex: microcontrol
            [unit type]             [granularity]
            infantry                squad               (a group of infantry)
            vehicle                 vehicle             (a single vehicle)
            aircraft                aircraft            (a single aircraft)
            artillery               firestation         (a single set of missiles)
            logistics               all base structures without defensive capacities
    
        - ex: macrocontrol
            [unit type]             [granularity]
            infantry                infantry commander  (groups of squads)
            vehicle                 star                (groups of vehicles)
            aircraft                wing                (groups of aircraft)
            artillery               battery             (groups of artillery)
            logistics               convoy routes       (groups of convoy moves)
    
    
    - underground combat
        -- no aircraft
        -- vehicles limited to small ones
        -- mostly infantry battle vs automated defense systems
        -- random loot? location is a weapons cache?
    
    - behavior tester / btree editor
        (insert photo of notepad pages)
    
    - commander learning system
        - they have a behavioral precedent which you can slowly change
            -- change like coefficients of a polynomial
        - when units die the attrs of the downed unit + their killers' are avg'd in another deadAttrHash
        - use this for commander reports
            -- "our vehicle armor is too thin!" if enemy unit armor > killed unit armor && enemy unit type == killed type
        - each commander should grant you 1 such report at the end of every battle
    
    - capture enemy commanders, chance of conversion
        -- like pokemon
    
    - mercenary army
        - online community can serve as a military market
        - make deals, buy stuff for your armies
        - trade, chat with other players
        - bypass some ingame resource requirements
        - make codes for people to share units and resources from their games
        - importing these resources by inputting your given code
        - generate these codes
        - limit what can be traded
        - code contains all that's needed to reimplement the traded items in your own instance of the game
            - new tech = new btree
    
    - technology as a resource
        -- a resource that can be moved around
        -- researchable resource (0 atom requirement)
        -- enemy may move instance of a technology resource around if it's about to be captured, or destroy it
        -- once unknown tech is researched, you can reproduce the technology is needed for synthesizers that use it
        -- you can use the technology when not researched if you have a copy, but it is tied to location (1 to 1 with the thing that uses it)
        -- tech is virtual but manifests itself in physical objects (blueprints/documents)
        -- once you have a critical mass of tech docs, that becomes a base tech (no tech docs needed to use the tech)
        -- captured tech can be transported to another location just like any other resource
    
    - tutorial for new players
      -- day 1 - 5 (campaign turns 1 to 5)
        --- a legit campaign can be based off the player's state at the end of a tutorial period (1-5)
