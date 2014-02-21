define ->
  (world) ->
    treeClass = world.Classes.Tree
    
    # Pick from 5 to 20 points at random to build a forest around each.
    forestLocations = ($.R(0, world.w) for i in [0..$.R(5,20)])
    for x in forestLocations
      treesInForest = $.R(3, 10)
      for i in [0..treesInForest]
        treeX = x + $.R(-60, 60)
        tree = new treeClass {
          x : treeX
          y : world.height treeX
        }
        world.add tree
    return