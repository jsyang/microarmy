require [
  '../core/util'
  '../core/util/XHash'
  '../core/Battle/Pawn'
], ($, XHash, Pawn) ->

  teams =
    '0' : [
      { x : 31,   team : 0, health : { current : 12 } }
      { x : 26,   team : 0, health : { current : 0 } }
      { x : 126,  team : 0 }
      { x : 113,  team : 0, health : { current : 12 } }
      { x : 27,   team : 0, health : { current : 12 } }
    ]
    
    '1' : [
      { x : 17,   team : 1 }
      { x : 11,   team : 1 }
      { x : 73,   team : 1, health : { current : 12 }, sight: 2 }
      { x : 78,   team : 1 }
      { x : 111,   team : 1 }
    ]
  
  mockPawns = []
  
  (
    (
      mockPawns.push(new Pawn(p))
    ) for p in v
  ) for k, v of teams
  
  pendingRemovalPawn = new Pawn({ x : 256, team : 3, corpsetime : 0 })
  outOfBoundsPawn = new Pawn({ x : 256, team : 2 })
  nBucketsPawn = new Pawn({ x : 130,    team : 1 })
  
  queryPawn1 = new Pawn({ x : 30,   team : 1, health : { current : 12 }, sight: 2 })
  queryPawn2 = new Pawn({ x : 25,   team : 1, health : { current : 12 }, sight: 2 })
  
  describe 'XHash', ->
    it 'throws if no width is given', ->
      expect( -> xh = new XHash ).toThrow()
  
    describe 'flush', ->
      it 'clears buckets', ->
        xh = new XHash({ w : 127 })
        ( xh.add(p) ) for p in mockPawns
        expect(xh._.buckets[0].length).toEqual(5)
        expect(xh._.buckets[1].length).toEqual(5)
        
        xh.flush()
        expect(xh._.buckets[0].length).toEqual(0)
        expect(xh._.buckets[1].length).toEqual(0)
    
    describe 'add', ->
      it 'puts pawns correctly in their buckets', ->
        xh = new XHash({ w : 127 })
        ( xh.add(p) ) for p in mockPawns
        expect(xh._.buckets[0][0]).toEqual(mockPawns[0])
        expect(xh._.buckets[1][4]).toEqual(mockPawns[9])
      
      it 'does nothing if a pawn is out of bounds', ->
        xh = new XHash({ w : 127 })
        xh.add(outOfBoundsPawn)
        expect(xh._.buckets).toEqual([[],[]])
        
    describe 'getNBucketsByCoord', ->
      it 'fetches the correct buckets', ->
        xh = new XHash({ w : 250 })
        ( xh.add(p) ) for p in mockPawns
        r1 = xh.getNBucketsByCoord(nBucketsPawn, 1)
        r2 = xh.getNBucketsByCoord(nBucketsPawn, 2)
        
        expect(r1.length).toEqual(5)
        expect(r2.length).toEqual(10)
        
      it 'fetches only from direction onwards if ray is defined', ->
        xh = new XHash({ w : 250 })
        ( xh.add(p) ) for p in mockPawns
        r1 = xh.getNBucketsByCoord(nBucketsPawn, 2, 1)
        expect(r1.length).toEqual(0)
        
        xh.add(nBucketsPawn)
        r2 = xh.getNBucketsByCoord(nBucketsPawn, 2, 1)
        expect(r2.length).toEqual(1)
        
        r = xh.getNBucketsByCoord(nBucketsPawn, 0)
        expect(r.length).toEqual(1)
        
        r = xh.getNBucketsByCoord(nBucketsPawn, 2, 1)
        expect(r.length).toEqual(1)
        r = xh.getNBucketsByCoord(nBucketsPawn, 2, -1)
        expect(r.length).toEqual(11)
      
    describe 'getNearestEnemy', ->
      it 'gets enemies that are alive', ->
        xh = new XHash({ w : 250 })
        ( xh.add(p) ) for p in mockPawns
        expect(xh.getNearestEnemy(queryPawn1)).toEqual(mockPawns[0])
        
      it 'doesnt get enemies that are pending removal', ->
        xh = new XHash({ w : 250 })
        xh.add(pendingRemovalPawn)
        expect(xh.getNearestEnemy(queryPawn1)).toBeUndefined()
    
    describe 'getCrowdedEnemy', ->
      it 'gets the last enemy of the bucket which contains the most enemies', ->
        xh = new XHash({ w : 250 })
        ( xh.add(p) ) for p in mockPawns
        expect(xh.getNearestEnemy(queryPawn2)).toEqual(mockPawns[4])