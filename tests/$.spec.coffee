require [
  '../core/util'
], ($) ->
  
  global.$ = $
  
  describe '$', ->
  
    describe 'R', ->
      it 'returns a random int within the interval inclusive x100', ->
        (
          a = $.R(0,2)
          expect(a).toBeGreaterThan(-1)
          expect(a).toBeLessThan(3)
        ) for i in [0..1e2]
      
    describe 'sum', ->
      it 'sums dicts correctly', ->
        dict = {
          a : 1
          b : 2
          c : 3
          d : 4
        }
        expect($.sum(dict)).toEqual(10)
        
      it 'sums arrays correctly', ->
        arr = [
          1
          2
          3
          4
        ]
        expect($.sum(arr)).toEqual(10)
    
    describe 'extend', ->
      it 'returns an empty obj {} if target is undefined', ->
        target = undefined
        r = $.extend(target, {})
        expect(r).toEqual({})
    
      it 'returns the target obj', ->
        target =
          b : 4
          c : 3
        r = $.extend target, {}
        expect(r).toEqual(target)
    
      it 'copies all properties from extender to target with overwrite', ->
        extender =
          a : 1
          b : 2
        target =
          b : 4
          c : 3
        r = $.extend target, extender
        
        expect(r.a).toEqual(1)
        expect(r.b).toEqual(2)
        expect(r.c).toEqual(3)
      