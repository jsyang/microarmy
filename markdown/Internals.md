# Internals

## Hierarchy of Battleview Entities
![topdown](images/hierarchy.png)

## PawnControllers

**Squads** are created by the Team's **Commander** entity for accomplishing various tasks in the battleview, a squad is made of >=8 PistolInfantry points. As PawnControllers are abstract entities, they cannot be targeted directly, though indirectly the status is dependent upon the sum statuses of its individual members.  

    Unit                PistolInfantry points

    PistolInfantry      1
    RocketInfantry      2
    EngineerInfantry    4

    APC                 4
    MedTank             4

    SpecialAttackCar    5

Each squad "strength" is the tally of these member values. So an enemy PawnController can target the most valuable targets in the squad to destroy the squad's usefulness. Once a squad's strength is < 8 points, it's disbanded; all squad members proceed with their independent (non-squad based) behaviors.

Individual (non-squad) behavior ought to be more complicated; retreat for medical attention, berserking, etc.
Squad based behavior should achieve high level goals (like defend), which individuals shouldn't have. Also has additional logic to keep the squad members working cohesively.

Commander's # of simultaneously controlled squads are proportional to its "skill / strength" level. Controlling more squads means either committing better skilled Commanders or more Commanders. Commanders receive experience from battleview actions, not individual units.

Each commander should tied to a comm___ structure, and when destroyed, the commander should be removed from the battle. If the Commander is tied to a CommCenter and the CommCenter is destroyed, there is a chance the Commander is lost.  



## Mission Objectives

A simple Win/Lose for each Team in each battle. Battle ends when a Team wins and/or Player's Team loses. Objectives contained as a list in an instance of Team.  

ex: Scaffold completes and builds a commcenter  
(inserted as an extra step in the low-level behavior or as a behavior itself)

- send message to world: {type: CommCenter, event: MISSION.EVENT.BUILT}

world.cycle()  

* processInstances() (this is where the message is generated)
  * processEvents() -> produces results of the mission events

Each TEAM holds its own set of objectives / shares a list with an allied TEAM. Currently shared objectives are not supported. A workaround is that you can subclass a specific class and try to assign mission event triggers to that specfically.