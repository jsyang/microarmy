define([
  'core/util/$'
], function($) { return Class.extend({
    init : function(params){
      this._=$.extend({
        maxMessages : 1<<10,        // todo: save to localStorage if it goes over!
        messages    : [],
        lastupdate  : undefined,
        el          : undefined,

        show : { // filter for which messages to show, used in conjunction with cb{}
          low     : true,
          normal  : true,
          urgent  : true
        },
        cb : {                      // render a message a certain way
          urgent : undefined,
          normal : undefined,
          low    : undefined
        }
      },params);
    },

    // todo : possibly overwrite window.console so all console.logs actually write to our log class?
    event  : function(e) { var _ = this._;
      _.messages.unshift(e);
      var cb = _.cb[e.priority? e.priority : 'normal'];
      if(cb) cb(e);
    },

    render : function() { var _ = this._;
      // Turns init obj into a textarea element
      var el = document.createElement('textarea');
      for(var attr in _.el) { if(_.el[v]) el[v] = _.el[v]; }
      _.el = el;
    }
  });
});
