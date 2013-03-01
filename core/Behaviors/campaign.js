// Generated by CoffeeScript 1.4.0

define({
  Decorators: {
    TRUE: true,
    FALSE: false,
    isStoreEmpty: function() {
      return this.store.isEmpty();
    },
    printXY: function() {
      console.log(this.x, this.y);
      return true;
    },
    tryMaintainResources: function() {
      this.store.tryMaintain();
      return true;
    }
  },
  Trees: {
    Tile: '<[!isStoreEmpty], [printXY], [tryMaintainResources]>'
  }
});