define([
  'core/util/$',
  'core/util/Class'
], function($, Class){

  var Manipulator = Class.extend({
    type : undefined,                 // synthesizer, maintainer, disassembler
    init : function(params) {
      this._ = $.extend({
        tech      : undefined,
        product   : undefined,        // what does it end up making?
        source    : undefined         // pool of available ingredients
        // auto synthesizes based on what's available (not in resource reserves)
        // the caller makes sure it passes the correct source, especially for maintainer
        // first, reserves
        // then production
      }, params);
    }
  });

  var Maintainer = Manipulator.extend({
    maintain : function() { var _ = this._;
      if($$.isUndefined(_.source)) {
        throw new Error('no source given for processor');
        /*
          if not enough ingredients per product,
          there's a chance of product loss in the source!

        */
      }
    }
  });

  var Disassembler = Manipulator.extend({
    // todo: move this functionality into behavior
    disassemble : function() { var _ = this._;
      if($$.isUndefined(_.source)) {
        throw new Error('no source given for processor');
        /*
          if any product exists,
            decompose it into its ingredients (chance of loss)
          if it's the atomizer
            decompose into atom "ingots" or throw atoms back onto location's atom pool
        */
      }
    }
  });

  var Synthesizer = Class.extend({
    // todo: move this functionality into behavior
    synthesize : function() { var _ = this._;
      if($$.isUndefined(_.source)) {
        throw new Error('no source given for processor');
        /*
          if enough ingredients exist per product
            create the assembly
          if it's the universal constructor
            and there's enough atoms of a certain type around, and the technology has been researched
              create the object
        */
      }
    }
  });

  return {
    Disassembler  : Disassembler,
    Synthesizer   : Synthesizer,
    Maintainer    : Maintainer
  };

});