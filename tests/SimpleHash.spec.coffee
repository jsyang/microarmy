require [
  '../core/util'
  '../core/util/SimpleHash'
], ($, SimpleHash) ->    
  
  global.$ = $
  
  describe 'SimpleHash', ->    
    it 'throws if no width given', ->
      expect( -> new SimpleHash({}) ).toThrow()
    
    sh = {}
    
    describe 'flush', ->
      beforeEach ->
        sh = new SimpleHash({
          w       : 64
          buckets : [{ '0': 90 }]
          cycles  : 1
        })
        
      it 'clears cycles', ->
        sh.flush()
        expect(sh._.cycles).toEqual(0)
      
      it 'clears buckets', ->
        sh.flush()
        expect(sh._.buckets).toEqual([{},{}])
        
    describe 'add', ->
      beforeEach ->
        sh = new SimpleHash({
          w       : 128
          buckets : [{ '0': 90 }, { '0' : 10 }]
        })
      
      it 'counts pawn (x:63) in bucket 0', ->
        sh.add({ _ : { team : 0, x : 63 } })
        expect(sh._.buckets[0]['0']).toEqual(91)
      
      it 'counts pawn (x:92) in bucket 1', ->
        sh.add({ _ : { team : 0, x : 92 } })
        expect(sh._.buckets[1]['0']).toEqual(11)
      
      it 'doesnt count out-of-bounds pawn (x towards +Infinity)', ->
        sh.add({ _ : { team : 0, x : 592 } })
        expect(sh._.buckets[0]['0']).toEqual(90)
        expect(sh._.buckets[1]['0']).toEqual(10)
        
      it 'doesnt count out-of-bounds pawn (x<0)', ->
        sh.add({ _ : { team : 0, x : -1 } })
        expect(sh._.buckets[0]['0']).toEqual(90)
        expect(sh._.buckets[1]['0']).toEqual(10)
        
    describe 'getModeBucket', ->
      it 'gets the bucket with the highest event count', ->
        sh = new SimpleHash({
          w       : 128
          buckets : [{ '0':90, '1':1 }, { '0':10, '1':10 }]
        })
      
        expect(sh.getModeBucket(0)).toEqual(0)
        expect(sh.getModeBucket(1)).toEqual(1)
      