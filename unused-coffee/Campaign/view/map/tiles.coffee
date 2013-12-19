define ->
  tiles =
    '24x24' :
      'city' : [
        [2,0]
        [2,1]
        [2,2]
        [3,0]
        [3,1]
        [3,2]
        [4,0]
        [4,1]
        [4,2]
      ]
      
      'base' : [
        [2,6]
        [2,7]
        [2,8]
        [3,6]
        [3,7]
        [3,8]
        [4,6]
        [4,7]
        [4,8]
      ]
    
    '8x8' :
      'road' :
        'r2' : [3, 19]
        'r8' : [3, 17]
        'r7' : [3, 21]
        'r10': [5, 19]
        'r9' : [1, 19]
        'r6' : [5, 17]
        'r5' : [1, 17]
        'r4' : [5, 21]
        'r3' : [1, 21]
        'r0' : [4, 19]
        'r1' : [3, 18]
      
      'city' : [
        [0,27]
        [0,28]
        [1,27]
        [1,28]
      ]
      
      'base' : [
        [0,25]
        [0,26]
        [1,25]
        [1,26]
      ]
        
      water :
        tile : [3,  0]
      
      sand :
        tile : [1,  1]
        ne   : [0,  2]
        n    : [0,  1]
        nw   : [0,  0]
        se   : [2,  0]
        s    : [2,  1]
        sw   : [2,  2]
        e    : [1,  2]
        w    : [1,  0]
      
      plain :
        tile : [16, 1]
        ne   : [15, 2]
        n    : [15, 1]
        nw   : [15, 0]
        se   : [17, 2]
        s    : [17, 1]
        sw   : [17, 0]
        e    : [16, 2]
        w    : [16, 0]
          
      hill :
        tile : [16, 4]
        ne   : [15, 5]
        n    : [15, 4]
        nw   : [15, 3]
        se   : [17, 5]
        s    : [17, 4]
        sw   : [17, 3]
        e    : [16, 5]
        w    : [16, 3]
      
      butte :
        tile : [16, 7]
        ne   : [15, 8]
        n    : [15, 7]
        nw   : [15, 6]
        se   : [17, 8]
        s    : [17, 7]
        sw   : [17, 6]
        e    : [16, 8]
        w    : [16, 6]